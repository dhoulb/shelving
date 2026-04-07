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
import type { Collection } from "../../db/collection/Collection.js";
import { DBProvider } from "../../db/provider/DBProvider.js";
import { LazyDeferredSequence } from "../../sequence/LazyDeferredSequence.js";
import type { Data, DataProp } from "../../util/data.js";
import { joinDataKey } from "../../util/data.js";
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

function _getCollection<T extends Data>(firestore: Firestore, c: string): CollectionReference<T> {
	return firestore.collection(c) as CollectionReference<T>;
}

/** Create a corresponding `QueryReference` from a Query. */
function _getQuery<T extends Data>(firestore: Firestore, c: string, q?: ItemQuery<string, T>): Query<T> {
	let ref: Query<T> = _getCollection<T>(firestore, c);
	if (q) {
		for (const { key, direction } of getOrders(q)) {
			const k = joinDataKey(key);
			ref = ref.orderBy(k === "id" ? ID : k, direction);
		}
		for (const { key, operator, value } of getFilters(q)) {
			const k = joinDataKey(key);
			ref = ref.where(k === "id" ? ID : k, OPERATORS[operator], value);
		}
		const l = getLimit(q);
		if (typeof l === "number") ref = ref.limit(l);
	}
	return ref;
}

function _getItemArray<T extends Data>(snapshot: QuerySnapshot<T>): Items<string, T> {
	return snapshot.docs.map(_getItem);
}

function _getItem<T extends Data>(snapshot: QueryDocumentSnapshot<T>): Item<string, T> {
	const data = snapshot.data();
	return getItem(snapshot.id, data);
}

function _getOptionalItem<T extends Data>(snapshot: DocumentSnapshot<T>): OptionalItem<string, T> {
	const data = snapshot.data();
	if (data) return getItem(snapshot.id, data);
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function _getFieldValues<T extends Data>(updates: Updates<T>): UpdateData<T> {
	return getObject(mapItems(getUpdates(updates), _getFieldValue)) as UpdateData<T>;
}
function _getFieldValue({ key, action, value }: Update): DataProp<Data> {
	const k = joinDataKey(key);
	if (action === "set") return [k, value];
	if (action === "sum") return [k, FieldValue.increment(value)];
	if (action === "with") return [k, FieldValue.arrayUnion(...value)];
	if (action === "omit") return [k, FieldValue.arrayRemove(...value)];
	return action; // Never happens.
}

/**
 * Firestore server database provider.
 * - Works with the Firebase Admin SDK for Node.JS
 */
export class FirestoreServerProvider extends DBProvider<string> {
	private readonly _firestore: Firestore;

	constructor(firestore = new Firestore()) {
		super();
		this._firestore = firestore;
	}

	async getItem<T extends Data>({ name }: Collection<string, string, T>, id: string): Promise<OptionalItem<string, T>> {
		return _getOptionalItem(await _getCollection<T>(this._firestore, name).doc(id).get());
	}

	getItemSequence<T extends Data>({ name }: Collection<string, string, T>, id: string): AsyncIterable<OptionalItem<string, T>> {
		const ref = _getCollection<T>(this._firestore, name).doc(id);
		return new LazyDeferredSequence(sequence =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getOptionalItem(snapshot)), //
				reason => sequence.reject(reason),
			),
		);
	}

	async addItem<T extends Data>({ name }: Collection<string, string, T>, data: T): Promise<string> {
		return (await _getCollection<T>(this._firestore, name).add(data)).id;
	}

	async setItem<T extends Data>({ name }: Collection<string, string, T>, id: string, data: T): Promise<void> {
		await _getCollection<T>(this._firestore, name).doc(id).set(data);
	}

	async updateItem<T extends Data>({ name }: Collection<string, string, T>, id: string, updates: Updates<T>): Promise<void> {
		await _getCollection<T>(this._firestore, name).doc(id).update(_getFieldValues(updates));
	}

	async deleteItem<T extends Data>({ name }: Collection<string, string, T>, id: string): Promise<void> {
		await _getCollection<T>(this._firestore, name).doc(id).delete();
	}

	override async countQuery<T extends Data>({ name }: Collection<string, string, T>, q?: ItemQuery<string, T>): Promise<number> {
		const snapshot = await _getQuery(this._firestore, name, q).count().get();
		return snapshot.data().count;
	}

	async getQuery<T extends Data>({ name }: Collection<string, string, T>, q?: ItemQuery<string, T>): Promise<Items<string, T>> {
		return _getItemArray(await _getQuery(this._firestore, name, q).get());
	}

	getQuerySequence<T extends Data>({ name }: Collection<string, string, T>, q?: ItemQuery<string, T>): AsyncIterable<Items<string, T>> {
		const ref = _getQuery(this._firestore, name, q);
		return new LazyDeferredSequence(sequence =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getItemArray(snapshot)), //
				reason => sequence.reject(reason),
			),
		);
	}

	async setQuery<T extends Data>({ name }: Collection<string, string, T>, q: ItemQuery<string, T>, data: T): Promise<void> {
		return await bulkWrite(this._firestore, name, q, (w, s) => void w.set(s.ref, data));
	}

	async updateQuery<T extends Data>({ name }: Collection<string, string, T>, q: ItemQuery<string, T>, updates: Updates<T>): Promise<void> {
		const fieldValues = _getFieldValues(updates);
		return await bulkWrite(this._firestore, name, q, (w, s) => void w.update(s.ref, fieldValues));
	}

	async deleteQuery<T extends Data>({ name }: Collection<string, string, T>, q: ItemQuery<string, T>): Promise<void> {
		return await bulkWrite(this._firestore, name, q, (w, s) => void w.delete(s.ref));
	}
}

/** Perform a bulk update on a set of documents using a `BulkWriter` */
async function bulkWrite<T extends Data>(
	firestore: Firestore,
	c: string,
	q: ItemQuery<string, T>,
	callback: (writer: BulkWriter, snapshot: QueryDocumentSnapshot<T>) => void,
): Promise<void> {
	const writer = firestore.bulkWriter();
	const ref = _getQuery(firestore, c, q).limit(BATCH_SIZE).select() as Query<T>; // `select()` turns the query into a field mask query (with no field masks) which saves data transfer and memory.
	let current: Query<T> | false = ref;
	while (current) {
		const { docs, size }: QuerySnapshot<T> = await current.get();
		for (const s of docs) callback(writer, s);
		current = size >= BATCH_SIZE && (ref.startAfter(docs.pop()).select() as Query<T>);
		void writer.flush();
	}
	await writer.close();
}

const BATCH_SIZE = 1000;
