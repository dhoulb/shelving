import type {
	BulkWriter,
	CollectionReference,
	DocumentSnapshot,
	Query,
	QueryDocumentSnapshot,
	QuerySnapshot,
	UpdateData,
} from "@google-cloud/firestore";
import { FieldPath, FieldValue, Firestore } from "@google-cloud/firestore";
import { AsyncProvider } from "../../db/Provider.js";
import { LazyDeferredSequence } from "../../sequence/LazyDeferredSequence.js";
import type { Data, Database, DataKey, DataProp } from "../../util/data.js";
import type { Item, Items, OptionalItem } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { getObject } from "../../util/object.js";
import type { ItemQuery } from "../../util/query.js";
import { getFilters, getLimit, getOrders } from "../../util/query.js";
import { mapItems } from "../../util/transform.js";
import type { Update, Updates } from "../../util/update.js";
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

function _getCollection<T extends Database, K extends DataKey<T>>(firestore: Firestore, c: K): CollectionReference<T[K]> {
	return firestore.collection(c) as CollectionReference<T[K]>;
}

/** Create a corresponding `QueryReference` from a Query. */
function _getQuery<T extends Database, K extends DataKey<T>>(firestore: Firestore, c: K, q?: ItemQuery<string, T[K]>): Query<T[K]> {
	let query: Query<T[K]> = _getCollection<T, K>(firestore, c);
	if (q) {
		for (const { key, direction } of getOrders(q)) query = query.orderBy(key === "id" ? ID : key, direction);
		for (const { key, operator, value } of getFilters(q)) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
		const l = getLimit(q);
		if (typeof l === "number") query = query.limit(l);
	}
	return query;
}

function _getItemArray<T extends Database, K extends DataKey<T>>(snapshot: QuerySnapshot<T[K]>): Items<string, T[K]> {
	return snapshot.docs.map(_getItem);
}

function _getItem<T extends Database, K extends DataKey<T>>(snapshot: QueryDocumentSnapshot<T[K]>): Item<string, T[K]> {
	const data = snapshot.data();
	return getItem(snapshot.id, data);
}

function _getOptionalItem<T extends Database, K extends DataKey<T>>(snapshot: DocumentSnapshot<T[K]>): OptionalItem<string, T[K]> {
	const data = snapshot.data();
	if (data) return getItem(snapshot.id, data);
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function _getFieldValues<T extends Data>(updates: Updates<T>): UpdateData<T> {
	return getObject(mapItems(getUpdates(updates), _getFieldValue)) as UpdateData<T>;
}
function _getFieldValue({ key, action, value }: Update): DataProp<Data> {
	if (action === "set") return [key, value];
	if (action === "sum") return [key, FieldValue.increment(value)];
	if (action === "with") return [key, FieldValue.arrayUnion(...value)];
	if (action === "omit") return [key, FieldValue.arrayRemove(...value)];
	return action; // Never happens.
}

/**
 * Firestore server database provider.
 * - Works with the Firebase Admin SDK for Node.JS
 */
export class FirestoreServerProvider<T extends Database> extends AsyncProvider<string, T> {
	private readonly _firestore: Firestore;

	constructor(firestore = new Firestore()) {
		super();
		this._firestore = firestore;
	}

	async getItem<K extends DataKey<T>>(c: K, id: string): Promise<OptionalItem<string, T[K]>> {
		return _getOptionalItem(await _getCollection<T, K>(this._firestore, c).doc(id).get());
	}

	getItemSequence<K extends DataKey<T>>(c: K, id: string): AsyncIterable<OptionalItem<string, T[K]>> {
		const ref = _getCollection<T, K>(this._firestore, c).doc(id);
		return new LazyDeferredSequence(sequence =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getOptionalItem(snapshot)), //
				reason => sequence.reject(reason),
			),
		);
	}

	async addItem<K extends DataKey<T>>(c: K, data: T[K]): Promise<string> {
		return (await _getCollection<T, K>(this._firestore, c).add(data)).id;
	}

	async setItem<K extends DataKey<T>>(c: K, id: string, data: T[K]): Promise<void> {
		await _getCollection<T, K>(this._firestore, c).doc(id).set(data);
	}

	async updateItem<K extends DataKey<T>>(c: K, id: string, updates: Updates<T[K]>): Promise<void> {
		await _getCollection<T, K>(this._firestore, c).doc(id).update(_getFieldValues(updates));
	}

	async deleteItem<K extends DataKey<T>>(c: K, id: string): Promise<void> {
		await _getCollection<T, K>(this._firestore, c).doc(id).delete();
	}

	override async countQuery<K extends DataKey<T>>(c: K, q?: ItemQuery<string, T[K]>): Promise<number> {
		const snapshot = await _getQuery(this._firestore, c, q).count().get();
		return snapshot.data().count;
	}

	async getQuery<K extends DataKey<T>>(c: K, q?: ItemQuery<string, T[K]>): Promise<Items<string, T[K]>> {
		return _getItemArray(await _getQuery(this._firestore, c, q).get());
	}

	getQuerySequence<K extends DataKey<T>>(c: K, q?: ItemQuery<string, T[K]>): AsyncIterable<Items<string, T[K]>> {
		const ref = _getQuery(this._firestore, c, q);
		return new LazyDeferredSequence(sequence =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getItemArray(snapshot)), //
				reason => sequence.reject(reason),
			),
		);
	}

	async setQuery<K extends DataKey<T>>(c: K, q: ItemQuery<string, T[K]>, data: T[K]): Promise<void> {
		return await bulkWrite(this._firestore, c, q, (w, s) => void w.set(s.ref, data));
	}

	async updateQuery<K extends DataKey<T>>(c: K, q: ItemQuery<string, T[K]>, updates: Updates): Promise<void> {
		const fieldValues = _getFieldValues(updates);
		return await bulkWrite(this._firestore, c, q, (w, s) => void w.update(s.ref, fieldValues));
	}

	async deleteQuery<K extends DataKey<T>>(c: K, q: ItemQuery<string, T[K]>): Promise<void> {
		return await bulkWrite(this._firestore, c, q, (w, s) => void w.delete(s.ref));
	}
}

/** Perform a bulk update on a set of documents using a `BulkWriter` */
async function bulkWrite<T extends Database, K extends DataKey<T>>(
	firestore: Firestore,
	c: K,
	q: ItemQuery<string, T[K]>,
	callback: (writer: BulkWriter, snapshot: QueryDocumentSnapshot<T[K]>) => void,
): Promise<void> {
	const writer = firestore.bulkWriter();
	const query = _getQuery(firestore, c, q).limit(BATCH_SIZE).select() as Query<T[K]>; // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
	let current: Query<T[K]> | false = query;
	while (current) {
		const { docs, size }: QuerySnapshot<T[K]> = await current.get();
		for (const s of docs) callback(writer, s);
		current = size >= BATCH_SIZE && (query.startAfter(docs.pop()).select() as Query<T[K]>);
		void writer.flush();
	}
	await writer.close();
}

const BATCH_SIZE = 1000;
