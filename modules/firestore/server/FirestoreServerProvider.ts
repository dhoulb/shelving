import type { ItemArray, ItemData, ItemQuery, ItemValue } from "../../db/ItemReference.js";
import type { AsyncProvider } from "../../provider/Provider.js";
import type { Data, DataProp } from "../../util/data.js";
import type { ImmutableObject } from "../../util/object.js";
import type { Update, Updates } from "../../util/update.js";
import type { BulkWriter, DocumentData, DocumentSnapshot, Query, QueryDocumentSnapshot, QuerySnapshot } from "@google-cloud/firestore";
import { FieldPath, FieldValue, Firestore } from "@google-cloud/firestore";
import { LazyDeferredSequence } from "../../sequence/LazyDeferredSequence.js";
import { getObject } from "../../util/object.js";
import { getFilters, getLimit, getOrders } from "../../util/query.js";
import { mapItems } from "../../util/transform.js";
import { getUpdates } from "../../util/update.js";

// Constants.
const ID = FieldPath.documentId();

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS = {
	is: "==",
	not: "!=",
	in: "in",
	out: "not-in",
	contains: "array-contains",
	gt: ">",
	gte: ">=",
	lt: "<",
	lte: "<=",
} as const;

/** Create a corresponding `QueryReference` from a Query. */
function _getQuery(firestore: Firestore, c: string, q: ItemQuery): Query {
	let query: Query = firestore.collection(c);
	for (const { key, direction } of getOrders(q)) query = query.orderBy(key === "id" ? ID : key, direction);
	for (const { key, operator, value } of getFilters(q)) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	const l = getLimit(q);
	if (typeof l === "number") query = query.limit(l);
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
	if (data) return { ...data, id: snapshot.id };
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
const _getFieldValues = <T extends Data>(updates: Updates<T>): ImmutableObject => getObject(mapItems(getUpdates(updates), _getFieldValue));
const _getFieldValue = ({ key, action, value }: Update): DataProp<Data> => [key, action === "sum" ? FieldValue.increment(value) : action === "set" ? value : action];

/**
 * Firestore server database provider.
 * - Works with the Firebase Admin SDK for Node.JS
 */
export class FirestoreServerProvider implements AsyncProvider {
	private readonly _firestore: Firestore;

	constructor(firestore = new Firestore()) {
		this._firestore = firestore;
	}

	async getItem(c: string, id: string): Promise<ItemValue> {
		return _getItemValue(await this._firestore.collection(c).doc(id).get());
	}

	getItemSequence(c: string, id: string): AsyncIterable<ItemValue> {
		const ref = this._firestore.collection(c).doc(id);
		return new LazyDeferredSequence(({ resolve, reject }) =>
			ref.onSnapshot(
				snapshot => resolve(_getItemValue(snapshot)), //
				reject,
			),
		);
	}

	async addItem(c: string, data: Data): Promise<string> {
		return (await this._firestore.collection(c).add(data)).id;
	}

	async setItem(c: string, id: string, data: Data): Promise<void> {
		await this._firestore.collection(c).doc(id).set(data);
	}

	async updateItem(c: string, id: string, updates: Updates): Promise<void> {
		await this._firestore.collection(c).doc(id).update(_getFieldValues(updates));
	}

	async deleteItem(c: string, id: string): Promise<void> {
		await this._firestore.collection(c).doc(id).delete();
	}

	async getQuery(c: string, q: ItemQuery): Promise<ItemArray> {
		return _getItemArray(await _getQuery(this._firestore, c, q).get());
	}

	getQuerySequence<K extends string>(c: K, q: ItemQuery): AsyncIterable<ItemArray> {
		const ref = _getQuery(this._firestore, c, q);
		return new LazyDeferredSequence(({ resolve, reject }) =>
			ref.onSnapshot(
				snapshot => resolve(_getItemArray(snapshot)), //
				reject,
			),
		);
	}

	async setQuery(c: string, q: ItemQuery, data: Data): Promise<number> {
		return await bulkWrite(this._firestore, c, q, (w, s) => void w.set(s.ref, data));
	}

	async updateQuery(c: string, q: ItemQuery, updates: Updates): Promise<number> {
		const fieldValues = _getFieldValues(updates);
		return await bulkWrite(this._firestore, c, q, (w, s) => void w.update<DocumentData>(s.ref, fieldValues));
	}

	async deleteQuery(c: string, q: ItemQuery): Promise<number> {
		return await bulkWrite(this._firestore, c, q, (w, s) => void w.delete(s.ref));
	}
}

/** Perform a bulk update on a set of documents using a `BulkWriter` */
async function bulkWrite(firestore: Firestore, c: string, q: ItemQuery, callback: (writer: BulkWriter, snapshot: QueryDocumentSnapshot) => void): Promise<number> {
	let count = 0;
	const writer = firestore.bulkWriter();
	const query = _getQuery(firestore, c, q).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
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
