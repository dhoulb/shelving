import type {
	BulkWriter as FirestoreBulkWriter,
	CollectionReference as FirestoreCollectionReference,
	DocumentSnapshot as FirestoreDocumentSnapshot,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	Query as FirestoreQueryReference,
	QuerySnapshot as FirestoreQuerySnapshot,
	Transaction as FirestoreTransaction,
	UpdateData as FirestoreUpdateData,
} from "@google-cloud/firestore";
import { FieldPath, FieldValue, Firestore } from "@google-cloud/firestore";
import type { Collection } from "../../db/collection/Collection.js";
import { DBProvider } from "../../db/provider/DBProvider.js";
import { UnsupportedError } from "../../error/UnsupportedError.js";
import { DeferredSequence } from "../../sequence/DeferredSequence.js";
import { LazySequence } from "../../sequence/LazySequence.js";
import type { MutableArray } from "../../util/array.js";
import type { Data, DataProp } from "../../util/data.js";
import { joinDataPath } from "../../util/data.js";
import type { Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { getObject } from "../../util/object.js";
import { getQueryFilters, getQueryLimit, getQueryOrders, type Query } from "../../util/query.js";
import { mapItems } from "../../util/transform.js";
import type { Update, Updates } from "../../util/update.js";
import { getUpdates } from "../../util/update.js";

// Constants.
const ID = FieldPath.documentId();
const BATCH_SIZE = 1000;

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

function _getItems<II extends string, TT extends Data>(snapshot: FirestoreQuerySnapshot<TT>): Items<II, TT> {
	return snapshot.docs.map(s => _getItem<II, TT>(s));
}

function _getItem<II extends string, TT extends Data>(snapshot: FirestoreQueryDocumentSnapshot<TT>): Item<II, TT> {
	return getItem(snapshot.id as II, snapshot.data()); // `as II` needed: Firestore snapshot.id is always string, not II.
}

function _getOptionalItem<II extends string, TT extends Data>(snapshot: FirestoreDocumentSnapshot<TT>): OptionalItem<II, TT> {
	const data = snapshot.data();
	if (data) return getItem(snapshot.id as II, data); // `as II` needed: Firestore snapshot.id is always string, not II.
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function _getFieldValues<TT extends Data>(updates: Updates<TT>): FirestoreUpdateData<TT> {
	return getObject(mapItems(getUpdates(updates), _getFieldValue)) as FirestoreUpdateData<TT>;
}
function _getFieldValue({ key, action, value }: Update): DataProp<Data> {
	const k = joinDataPath(key);
	if (action === "set") return [k, value];
	if (action === "sum") return [k, FieldValue.increment(value)];
	if (action === "with") return [k, FieldValue.arrayUnion(...value)];
	if (action === "omit") return [k, FieldValue.arrayRemove(...value)];
	return action; // Never happens.
}

/** Create a corresponding `FirestoreCollection` reference from a collection. */
function _getCollection<II extends string, TT extends Data>(
	firestore: Firestore,
	collection: Collection<string, II, TT>,
): FirestoreCollectionReference<TT> {
	return firestore.collection(collection.name) as FirestoreCollectionReference<TT>;
}

/** Create a corresponding `FirestoreQuery` reference from a collection and query. */
function _getQuery<II extends string, TT extends Data>(
	firestore: Firestore,
	c: Collection<string, II, TT>,
	q?: Query<Item<II, TT>>,
): FirestoreQueryReference<TT> {
	let ref: FirestoreQueryReference<TT> = _getCollection(firestore, c);
	if (q) {
		for (const { key, direction } of getQueryOrders(q)) {
			const k = joinDataPath(key);
			ref = ref.orderBy(k === "id" ? ID : k, direction);
		}
		for (const { key, operator, value } of getQueryFilters(q)) {
			const k = joinDataPath(key);
			ref = ref.where(k === "id" ? ID : k, OPERATORS[operator], value);
		}
		const l = getQueryLimit(q);
		if (typeof l === "number") ref = ref.limit(l);
	}
	return ref;
}

/**
 * Cloud Firestore database provider backed by the Firebase Admin SDK, implementing the `DBProvider` abstraction.
 *
 * - Runs server-side via `@google-cloud/firestore` (the Firebase Admin SDK for Node.JS).
 * - Supports realtime subscriptions through Firestore `onSnapshot` listeners.
 * - Collection writes (`setQuery`, `updateQuery`, `deleteQuery`) are batched through a Firestore `BulkWriter`.
 *
 * @see https://shelving.cc/firestore/server/FirestoreServerProvider
 */
export class FirestoreServerProvider<I extends string = string, T extends Data = Data> extends DBProvider<I, T> {
	private readonly _firestore: Firestore;

	/** Defaults to a new `Firestore()` using Application Default Credentials when no instance is passed. */
	constructor(firestore = new Firestore()) {
		super();
		this._firestore = firestore;
	}

	/** Perform a bulk update on a set of documents using a `BulkWriter` */
	private async _bulkWrite<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		q: Query<Item<II, TT>>,
		callback: (writer: FirestoreBulkWriter, snapshot: FirestoreQueryDocumentSnapshot) => void,
	): Promise<void> {
		const writer = this._firestore.bulkWriter();
		const ref = _getQuery(this._firestore, c, q).limit(BATCH_SIZE).select(); // `select()` turns the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: FirestoreQueryReference | false = ref;
		while (current) {
			const { docs, size } = await current.get();
			for (const s of docs) callback(writer, s);
			current = size >= BATCH_SIZE && ref.startAfter(docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}

	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return _getOptionalItem<II, TT>(await _getCollection(this._firestore, collection).doc(id).get());
	}

	override getItemSequence<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		const ref = _getCollection(this._firestore, c).doc(id);
		const sequence = new DeferredSequence<OptionalItem<II, TT>>();
		return new LazySequence(sequence, () =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getOptionalItem<II, TT>(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}

	override async addItem<II extends I, TT extends T>(c: Collection<string, II, TT>, data: TT): Promise<II> {
		return (await _getCollection(this._firestore, c).add(data)).id as II; // `as II` needed: Firestore returns string, not II.
	}

	override async setItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await _getCollection(this._firestore, c).doc(id).set(data);
	}

	override async updateItem<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await _getCollection(this._firestore, c).doc(id).update(_getFieldValues(updates));
	}

	override async deleteItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): Promise<void> {
		await _getCollection(this._firestore, c).doc(id).delete();
	}

	override async countQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<number> {
		const snapshot = await _getQuery(this._firestore, c, q).count().get();
		return snapshot.data().count;
	}

	override async getQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		return _getItems<II, TT>(await _getQuery(this._firestore, c, q).get());
	}

	override getQuerySequence<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): ItemsSequence<II, TT> {
		const ref = _getQuery(this._firestore, c, q);
		const sequence = new DeferredSequence<Items<II, TT>>();
		return new LazySequence(sequence, () =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getItems<II, TT>(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}

	/** Batched through a Firestore `BulkWriter`. */
	override async setQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>, data: TT): Promise<void> {
		return await this._bulkWrite(c, q, (w, s) => void w.set(s.ref, data));
	}

	/** Batched through a Firestore `BulkWriter`. */
	override async updateQuery<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		q: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		const fieldValues = _getFieldValues(updates);
		return await this._bulkWrite(c, q, (w, s) => void w.update(s.ref, fieldValues));
	}

	/** Batched through a Firestore `BulkWriter`. */
	override async deleteQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>): Promise<void> {
		return await this._bulkWrite(c, q, (w, s) => void w.delete(s.ref));
	}

	/**
	 * Runs the callback through `Firestore.runTransaction()`, which commits on success, rolls back on error, and retries the callback on contention.
	 * - Writes are buffered while the callback runs and applied when it resolves, so reads and writes can be freely interleaved.
	 * - Query writes (`setQuery()` etc.) read every matching document inside the transaction, so they are not batched — keep matching sets small.
	 * - Transactions are limited by Firestore to 270 seconds (with a 60-second idle timeout).
	 */
	override transact<X>(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		return this._firestore.runTransaction(async transaction => {
			const provider = new _FirestoreServerTransaction<I, T>(this._firestore, transaction);
			const result = await callback(provider);
			provider.commit();
			return result;
		});
	}
}

/** Transaction-scoped provider for `FirestoreServerProvider.transact()` — reads go through the Firestore transaction, writes buffer until `commit()`. */
class _FirestoreServerTransaction<I extends string, T extends Data> extends DBProvider<I, T> {
	private readonly _firestore: Firestore;
	private readonly _transaction: FirestoreTransaction;
	private readonly _writes: MutableArray<() => void> = [];

	constructor(firestore: Firestore, transaction: FirestoreTransaction) {
		super();
		this._firestore = firestore;
		this._transaction = transaction;
	}

	override async getItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return _getOptionalItem<II, TT>(await this._transaction.get(_getCollection(this._firestore, c).doc(id)));
	}

	/** Not supported inside a transaction — always throws `UnsupportedError`. */
	override getItemSequence<II extends I, TT extends T>(_c: Collection<string, II, TT>, _id: II): OptionalItemSequence<II, TT> {
		throw new UnsupportedError("FirestoreServerProvider does not support realtime subscriptions in transactions");
	}

	/** Generates the new document's id immediately, but buffers the write until commit (fails if the id already exists). */
	override async addItem<II extends I, TT extends T>(c: Collection<string, II, TT>, data: TT): Promise<II> {
		const ref = _getCollection(this._firestore, c).doc();
		this._writes.push(() => void this._transaction.create(ref, data));
		return ref.id as II; // `as II` needed: Firestore returns string, not II.
	}

	override async setItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		const ref = _getCollection(this._firestore, c).doc(id);
		this._writes.push(() => void this._transaction.set(ref, data));
	}

	override async updateItem<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		const ref = _getCollection(this._firestore, c).doc(id);
		const fieldValues = _getFieldValues(updates);
		this._writes.push(() => void this._transaction.update(ref, fieldValues));
	}

	override async deleteItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): Promise<void> {
		const ref = _getCollection(this._firestore, c).doc(id);
		this._writes.push(() => void this._transaction.delete(ref));
	}

	override async countQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<number> {
		const snapshot = await this._transaction.get(_getQuery(this._firestore, c, q).count());
		return snapshot.data().count;
	}

	override async getQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		return _getItems<II, TT>(await this._transaction.get(_getQuery(this._firestore, c, q)));
	}

	/** Not supported inside a transaction — always throws `UnsupportedError`. */
	override getQuerySequence<II extends I, TT extends T>(_c: Collection<string, II, TT>, _q?: Query<Item<II, TT>>): ItemsSequence<II, TT> {
		throw new UnsupportedError("FirestoreServerProvider does not support realtime subscriptions in transactions");
	}

	/** Reads the matching document refs now, but buffers the writes until commit. */
	override async setQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>, data: TT): Promise<void> {
		const snapshot = await this._transaction.get(_getQuery(this._firestore, c, q).select()); // `select()` reads only refs, saving data transfer.
		for (const s of snapshot.docs) this._writes.push(() => void this._transaction.set(s.ref, data));
	}

	/** Reads the matching document refs now, but buffers the writes until commit. */
	override async updateQuery<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		q: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		const fieldValues = _getFieldValues(updates);
		const snapshot = await this._transaction.get(_getQuery(this._firestore, c, q).select()); // `select()` reads only refs, saving data transfer.
		for (const s of snapshot.docs) this._writes.push(() => void this._transaction.update(s.ref, fieldValues));
	}

	/** Reads the matching document refs now, but buffers the writes until commit. */
	override async deleteQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>): Promise<void> {
		const snapshot = await this._transaction.get(_getQuery(this._firestore, c, q).select()); // `select()` reads only refs, saving data transfer.
		for (const s of snapshot.docs) this._writes.push(() => void this._transaction.delete(s.ref));
	}

	/** Not supported inside a transaction — always throws `UnsupportedError`. */
	override transact<X>(_callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		throw new UnsupportedError("FirestoreServerProvider does not support nested transactions");
	}

	/** Apply the buffered writes to the underlying Firestore transaction (called once the callback resolves, before Firestore commits). */
	commit(): void {
		for (const write of this._writes) write();
	}
}
