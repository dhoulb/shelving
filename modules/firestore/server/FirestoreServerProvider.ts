import type { ItemArray, ItemData, ItemStatement, ItemValue } from "../../db/Item.js";
import type { AsyncProvider } from "../../provider/Provider.js";
import type { Data } from "../../util/data.js";
import type { ImmutableObject, ObjectProp } from "../../util/object.js";
import type { Update, Updates } from "../../util/update.js";
import type { BulkWriter, DocumentData, DocumentSnapshot, Query, QueryDocumentSnapshot, QuerySnapshot } from "@google-cloud/firestore";
import { FieldPath, FieldValue, Firestore } from "@google-cloud/firestore";
import { LazyDeferredSequence } from "../../sequence/LazyDeferredSequence.js";
import { getObject } from "../../util/object.js";
import { mapItems } from "../../util/transform.js";
import { getUpdates } from "../../util/update.js";

// Constants.
const ID = FieldPath.documentId();

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS = {
	IS: "==",
	NOT: "!=",
	IN: "in",
	OUT: "not-in",
	CONTAINS: "array-contains",
	GT: ">",
	GTE: ">=",
	LT: "<",
	LTE: "<=",
} as const;

// Map `Filter.types` to `OrderByDirection`
const DIRECTIONS = {
	ASC: "asc",
	DESC: "desc",
} as const;

/** Create a corresponding `QueryReference` from a Query. */
function _getQuery(firestore: Firestore, collection: string, constraints: ItemStatement): Query {
	const { sorts, filters, limit } = constraints;
	let query: Query = firestore.collection(collection);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (typeof limit === "number") query = query.limit(limit);
	return query;
}

function _getItemArray(snapshot: QuerySnapshot): ItemArray {
	return snapshot.docs.map(_getItemData);
}

function _getItemData(snapshot: QueryDocumentSnapshot): ItemData {
	const data = snapshot.data();
	return { ...data, id: snapshot.id };
}

function _getItemValue(snapshot: DocumentSnapshot): ItemValue {
	const data = snapshot.data();
	return data ? { ...data, id: snapshot.id } : null;
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
const _getFieldValues = <T extends Data>(updates: Updates<T>): ImmutableObject => getObject(mapItems(getUpdates(updates), _getFieldValue));
const _getFieldValue = ({ keys, type, value }: Update): ObjectProp => [keys.join("."), type === "sum" ? FieldValue.increment(value) : type === "set" ? value : type];

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

	getItemSequence(collection: string, id: string): AsyncIterable<ItemValue> {
		const ref = this._firestore.collection(collection).doc(id);
		return new LazyDeferredSequence(({ resolve, reject }) =>
			ref.onSnapshot(
				snapshot => resolve(_getItemValue(snapshot)), //
				reject,
			),
		);
	}

	async addItem(collection: string, data: Data): Promise<string> {
		return (await this._firestore.collection(collection).add(data)).id;
	}

	async setItem(collection: string, id: string, data: Data): Promise<void> {
		await this._firestore.collection(collection).doc(id).set(data);
	}

	async updateItem(collection: string, id: string, updates: Updates): Promise<void> {
		await this._firestore.collection(collection).doc(id).update(_getFieldValues(updates));
	}

	async deleteItem(collection: string, id: string): Promise<void> {
		await this._firestore.collection(collection).doc(id).delete();
	}

	async getQuery(collection: string, constraints: ItemStatement): Promise<ItemArray> {
		return _getItemArray(await _getQuery(this._firestore, collection, constraints).get());
	}

	getQuerySequence<K extends string>(collection: K, constraints: ItemStatement): AsyncIterable<ItemArray> {
		const ref = _getQuery(this._firestore, collection, constraints);
		return new LazyDeferredSequence(({ resolve, reject }) =>
			ref.onSnapshot(
				snapshot => resolve(_getItemArray(snapshot)), //
				reject,
			),
		);
	}

	async setQuery(collection: string, constraints: ItemStatement, data: Data): Promise<number> {
		return await bulkWrite(this._firestore, collection, constraints, (w, s) => void w.set(s.ref, data));
	}

	async updateQuery(collection: string, constraints: ItemStatement, updates: Updates): Promise<number> {
		const fieldValues = _getFieldValues(updates);
		return await bulkWrite(this._firestore, collection, constraints, (w, s) => void w.update<DocumentData>(s.ref, fieldValues));
	}

	async deleteQuery(collection: string, constraints: ItemStatement): Promise<number> {
		return await bulkWrite(this._firestore, collection, constraints, (w, s) => void w.delete(s.ref));
	}
}

/** Perform a bulk update on a set of documents using a `BulkWriter` */
async function bulkWrite(firestore: Firestore, collection: string, constraints: ItemStatement, callback: (writer: BulkWriter, snapshot: QueryDocumentSnapshot) => void): Promise<number> {
	let count = 0;
	const writer = firestore.bulkWriter();
	const query = _getQuery(firestore, collection, constraints).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
	let current: Query | false = query;
	while (current) {
		const { docs, size }: QuerySnapshot = await current.get();
		count += size;
		for (const s of docs) callback(writer, s);
		current = size >= BATCH_SIZE && query.startAfter(docs.pop()).select();
		void writer.flush();
	}
	await writer.close();
	return count;
}

const BATCH_SIZE = 1000;
