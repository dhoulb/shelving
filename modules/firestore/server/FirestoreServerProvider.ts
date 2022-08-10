import type {
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	DocumentSnapshot as FirestoreDocumentSnapshot,
	Query as FirestoreQuery,
	QuerySnapshot as FirestoreQuerySnapshot,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	BulkWriter as FirestoreBulkWriter,
} from "@google-cloud/firestore";
import { Firestore, FieldValue as FirestoreFieldValue } from "@google-cloud/firestore";
import type { Entry } from "../../util/entry.js";
import type { FilterOperator } from "../../constraint/FilterConstraint.js";
import type { SortDirection } from "../../constraint/SortConstraint.js";
import type { Unsubscribe } from "../../observe/Observable.js";
import type { AsyncProvider } from "../../provider/Provider.js";
import type { ItemArray, ItemValue, ItemData, ItemConstraints } from "../../db/Item.js";
import { dispatchError, dispatchNext, Observer } from "../../observe/Observer.js";
import { ArrayUpdate } from "../../update/ArrayUpdate.js";
import { DataUpdate } from "../../update/DataUpdate.js";
import { Increment } from "../../update/Increment.js";
import { ObjectUpdate } from "../../update/ObjectUpdate.js";
import { Delete } from "../../update/Delete.js";
import { Update } from "../../update/Update.js";
import { Data } from "../../util/data.js";

// Constants.
// const ID = "__name__"; // DH: `__name__` is the entire path of the document. `__id__` is just ID.
const ID = "__id__"; // Internal way Firestore Queries can reference the ID of the current document.

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS: { readonly [K in FilterOperator]: FirestoreWhereFilterOp } = {
	IS: "==",
	NOT: "!=",
	IN: "in",
	OUT: "not-in",
	GT: ">",
	GTE: ">=",
	LT: "<",
	LTE: "<=",
	CONTAINS: "array-contains",
};

// Map `Filter.types` to `OrderByDirection`
const DIRECTIONS: { readonly [K in SortDirection]: FirestoreOrderByDirection } = {
	ASC: "asc",
	DESC: "desc",
};

/** Create a corresponding `QueryReference` from a Query. */
function _getQuery(firestore: Firestore, collection: string, constraints: ItemConstraints): FirestoreQuery {
	const { sorts, filters, limit } = constraints;
	let query: FirestoreQuery = firestore.collection(collection);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (typeof limit === "number") query = query.limit(limit);
	return query;
}

function _getItems(snapshot: FirestoreQuerySnapshot): ItemArray {
	return snapshot.docs.map(_getItemData);
}

function _getItemData(snapshot: FirestoreQueryDocumentSnapshot): ItemData {
	const data = snapshot.data();
	return { ...data, id: snapshot.id };
}

function _getItemValue(snapshot: FirestoreDocumentSnapshot): ItemValue {
	const data = snapshot.data();
	return data ? { ...data, id: snapshot.id } : null;
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function* _getFieldValues<T>(updates: Iterable<Entry<string, T | Update<T>>>, prefix = ""): Iterable<string | T | FirestoreFieldValue> {
	for (const [key, update] of updates) {
		if (update instanceof DataUpdate || update instanceof ObjectUpdate) {
			yield* _getFieldValues(update, `${prefix}${key}.`);
		} else if (update instanceof ArrayUpdate) {
			if (update.adds.length) {
				yield `${prefix}${key}`;
				yield FirestoreFieldValue.arrayUnion(...update.adds);
			}
			if (update.deletes.length) {
				yield `${prefix}${key}`;
				yield FirestoreFieldValue.arrayRemove(...update.deletes);
			}
		} else {
			yield `${prefix}${key}`;
			if (!(update instanceof Update)) yield update;
			else if (update instanceof Delete) yield FirestoreFieldValue.delete();
			else if (update instanceof Increment) yield FirestoreFieldValue.increment(update.amount);
			else yield update.transform();
		}
	}
}

/**
 * Firestore server database provider.
 * - Works with the Firebase Admin SDK for Node.JS
 */
export class FirestoreServerProvider implements AsyncProvider {
	private readonly _firestore: Firestore;

	constructor(firestore = new Firestore()) {
		this._firestore = firestore;
	}

	async getItem(collection: string, id: string): Promise<ItemValue> {
		return _getItemValue(await this._firestore.collection(collection).doc(id).get());
	}

	subscribeItem(collection: string, id: string, observer: Observer<ItemValue>): Unsubscribe {
		return this._firestore
			.collection(collection)
			.doc(id)
			.onSnapshot(
				snapshot => dispatchNext(observer, _getItemValue(snapshot)),
				thrown => dispatchError(observer, thrown),
			);
	}

	async addItem(collection: string, data: Data): Promise<string> {
		return (await this._firestore.collection(collection).add(data)).id;
	}

	async setItem(collection: string, id: string, data: Data): Promise<void> {
		await this._firestore.collection(collection).doc(id).set(data);
	}

	async updateItem(collection: string, id: string, update: DataUpdate): Promise<void> {
		await this._firestore
			.collection(collection)
			.doc(id)
			.update(...(_getFieldValues(update) as [string, unknown]));
	}

	async deleteItem(collection: string, id: string): Promise<void> {
		await this._firestore.collection(collection).doc(id).delete();
	}

	async getQuery(collection: string, constraints: ItemConstraints): Promise<ItemArray> {
		return _getItems(await _getQuery(this._firestore, collection, constraints).get());
	}

	subscribeQuery(collection: string, constraints: ItemConstraints, observer: Observer<ItemArray>): Unsubscribe {
		return _getQuery(this._firestore, collection, constraints).onSnapshot(
			snapshot => dispatchNext(observer, _getItems(snapshot)),
			thrown => dispatchError(observer, thrown),
		);
	}

	async setQuery(collection: string, constraints: ItemConstraints, data: Data): Promise<number> {
		return await bulkWrite(this._firestore, collection, constraints, (w, s) => void w.set(s.ref, data));
	}

	async updateQuery(collection: string, constraints: ItemConstraints, update: DataUpdate): Promise<number> {
		const fieldValues = _getFieldValues(update) as [string, unknown];
		return await bulkWrite(this._firestore, collection, constraints, (w, s) => void w.update(s.ref, ...fieldValues));
	}

	async deleteQuery(collection: string, constraints: ItemConstraints): Promise<number> {
		return await bulkWrite(this._firestore, collection, constraints, (w, s) => void w.delete(s.ref));
	}
}

/** Perform a bulk update on a set of documents using a `BulkWriter` */
async function bulkWrite(firestore: Firestore, collection: string, constraints: ItemConstraints, callback: (writer: FirestoreBulkWriter, snapshot: FirestoreQueryDocumentSnapshot) => void): Promise<number> {
	let count = 0;
	const writer = firestore.bulkWriter();
	const query = _getQuery(firestore, collection, constraints).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
	let current: FirestoreQuery | false = query;
	while (current) {
		const { docs, size }: FirestoreQuerySnapshot = await current.get();
		count += size;
		for (const s of docs) callback(writer, s);
		current = size >= BATCH_SIZE && query.startAfter(docs.pop()).select();
		void writer.flush();
	}
	await writer.close();
	return count;
}

const BATCH_SIZE = 1000;
