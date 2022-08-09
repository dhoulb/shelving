import type {
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	DocumentReference as FirestoreDocumentReference,
	DocumentSnapshot as FirestoreDocumentSnapshot,
	Query as FirestoreQuery,
	QuerySnapshot as FirestoreQuerySnapshot,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	CollectionReference as FirestoreCollectionReference,
	BulkWriter as FirestoreBulkWriter,
} from "@google-cloud/firestore";
import { Firestore, FieldValue as FirestoreFieldValue } from "@google-cloud/firestore";
import type { Data, Entity, Entities, OptionalEntity, Datas, Key } from "../../util/data.js";
import type { Entry } from "../../util/entry.js";
import type { FilterOperator } from "../../query/Filter.js";
import type { SortDirection } from "../../query/Sort.js";
import type { Unsubscribe } from "../../observe/Observable.js";
import type { AsyncProvider, ProviderCollection, ProviderDocument, ProviderQuery } from "../../provider/Provider.js";
import { dispatchError, dispatchNext, Observer } from "../../observe/Observer.js";
import { ArrayUpdate } from "../../update/ArrayUpdate.js";
import { DataUpdate } from "../../update/DataUpdate.js";
import { Increment } from "../../update/Increment.js";
import { ObjectUpdate } from "../../update/ObjectUpdate.js";
import { Delete } from "../../update/Delete.js";
import { Update } from "../../update/Update.js";

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

/** Get a Firestore DocumentReference for a given documente. */
function _getDocument<T extends Datas, K extends Key<T>>(firestore: Firestore, { collection, id }: ProviderDocument<T, K>): FirestoreDocumentReference<T[K]> {
	return firestore.doc(`${collection}/${id}`) as FirestoreDocumentReference<T[K]>;
}

/** Get a Firestore CollectionReference for a given document. */
function _getCollection<T extends Datas, K extends Key<T>>(firestore: Firestore, { collection }: ProviderCollection<T, K>): FirestoreCollectionReference<T[K]> {
	return firestore.collection(collection) as FirestoreCollectionReference<T[K]>;
}

/** Create a corresponding `QueryReference` from a Query. */
function _getQuery<T extends Datas, K extends Key<T>>(firestore: Firestore, ref: ProviderQuery<T, K>): FirestoreQuery<T[K]> {
	const { sorts, filters, limit } = ref;
	let query: FirestoreQuery<T[K]> = _getCollection(firestore, ref);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (typeof limit === "number") query = query.limit(limit);
	return query;
}

function _getEntities<T extends Data>(snapshot: FirestoreQuerySnapshot<T>): Entities<T> {
	return snapshot.docs.map(_getEntity);
}

function _getEntity<T extends Data>(snapshot: FirestoreQueryDocumentSnapshot<T>): Entity<T> {
	const data = snapshot.data();
	return { ...data, id: snapshot.id };
}

function _getOptionalEntity<T extends Data>(snapshot: FirestoreDocumentSnapshot<T>): OptionalEntity<T> {
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
export class FirestoreServerProvider<T extends Datas> implements AsyncProvider<T> {
	readonly firestore: Firestore;

	constructor(firestore = new Firestore()) {
		this.firestore = firestore;
	}

	async getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<OptionalEntity<T[K]>> {
		return _getOptionalEntity(await _getDocument(this.firestore, ref).get());
	}

	subscribeDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, observer: Observer<OptionalEntity<T[K]>>): Unsubscribe {
		return _getDocument(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, _getOptionalEntity(snapshot)),
			thrown => dispatchError(observer, thrown),
		);
	}

	async addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): Promise<string> {
		return (await _getCollection(this.firestore, ref).add(data)).id;
	}

	async setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): Promise<void> {
		await _getDocument(this.firestore, ref).set(data);
	}

	async updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): Promise<void> {
		await _getDocument(this.firestore, ref).update(...(_getFieldValues(update) as [string, unknown, ...unknown[]]));
	}

	async deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<void> {
		await _getDocument(this.firestore, ref).delete();
	}

	async getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<Entities<T[K]>> {
		return _getEntities(await _getQuery(this.firestore, ref).get());
	}

	subscribeQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, observer: Observer<Entities<T[K]>>): Unsubscribe {
		return _getQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, _getEntities(snapshot)),
			thrown => dispatchError(observer, thrown),
		);
	}

	async setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): Promise<number> {
		return await bulkWrite(this.firestore, ref, (w, s) => void w.set(s.ref, data));
	}

	async updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): Promise<number> {
		const fieldValues = _getFieldValues(update) as [string, unknown, ...unknown[]];
		return await bulkWrite(this.firestore, ref, (w, s) => void w.update(s.ref, ...fieldValues));
	}

	async deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<number> {
		return await bulkWrite(this.firestore, ref, (w, s) => void w.delete(s.ref));
	}
}

/** Perform a bulk update on a set of documents using a `BulkWriter` */
async function bulkWrite<T extends Datas, K extends Key<T>>(firestore: Firestore, ref: ProviderQuery<T, K>, callback: (writer: FirestoreBulkWriter, snapshot: FirestoreQueryDocumentSnapshot) => void): Promise<number> {
	let count = 0;
	const writer = firestore.bulkWriter();
	const query = _getQuery(firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
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
