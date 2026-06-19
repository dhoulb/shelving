import type {
	BulkWriter as FirestoreBulkWriter,
	CollectionReference as FirestoreCollectionReference,
	DocumentSnapshot as FirestoreDocumentSnapshot,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	Query as FirestoreQueryReference,
	QuerySnapshot as FirestoreQuerySnapshot,
	UpdateData as FirestoreUpdateData,
} from "@google-cloud/firestore";
import { FieldPath, FieldValue, Firestore } from "@google-cloud/firestore";
import type { Collection } from "../../db/collection/Collection.js";
import { DBProvider } from "../../db/provider/DBProvider.js";
import { DeferredSequence } from "../../sequence/DeferredSequence.js";
import { LazySequence } from "../../sequence/LazySequence.js";
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

/**
 * Cloud Firestore database provider backed by the Firebase Admin SDK, implementing the `DBProvider` abstraction.
 *
 * - Runs server-side via `@google-cloud/firestore` (the Firebase Admin SDK for Node.JS).
 * - Supports realtime subscriptions through Firestore `onSnapshot` listeners.
 * - Collection writes (`setQuery`, `updateQuery`, `deleteQuery`) are batched through a Firestore `BulkWriter`.
 *
 * @example
 * import { Firestore } from "@google-cloud/firestore";
 * const provider = new FirestoreServerProvider(new Firestore());
 *
 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider
 */
export class FirestoreServerProvider<I extends string = string, T extends Data = Data> extends DBProvider<I, T> {
	private readonly _firestore: Firestore;

	/**
	 * Create a provider wrapping a Firestore Admin SDK instance.
	 *
	 * @param firestore The `Firestore` instance to read and write through; defaults to a new `Firestore()`.
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider
	 */
	constructor(firestore = new Firestore()) {
		super();
		this._firestore = firestore;
	}

	/** Create a corresponding `FirestoreCollection` reference from a collection. */
	private _getCollection<TT extends T>(collection: Collection<string, I, TT>): FirestoreCollectionReference<TT> {
		return this._firestore.collection(collection.name) as FirestoreCollectionReference<TT>;
	}

	/** Create a corresponding `FirestoreQuery` reference from a collection and query. */
	private _getQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): FirestoreQueryReference<TT> {
		let ref: FirestoreQueryReference<TT> = this._getCollection(c);
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

	/** Perform a bulk update on a set of documents using a `BulkWriter` */
	private async _bulkWrite<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		q: Query<Item<II, TT>>,
		callback: (writer: FirestoreBulkWriter, snapshot: FirestoreQueryDocumentSnapshot) => void,
	): Promise<void> {
		const writer = this._firestore.bulkWriter();
		const ref = this._getQuery(c, q).limit(BATCH_SIZE).select(); // `select()` turns the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: FirestoreQueryReference | false = ref;
		while (current) {
			const { docs, size } = await current.get();
			for (const s of docs) callback(writer, s);
			current = size >= BATCH_SIZE && ref.startAfter(docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}

	/**
	 * Read a single item by ID from its Firestore document.
	 *
	 * @param collection The collection the item belongs to.
	 * @param id The ID of the item to read.
	 * @returns Promise resolving to the item, or `undefined` if the document does not exist.
	 * @example await provider.getItem(users, "abc123")
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/getItem
	 */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return _getOptionalItem<II, TT>(await this._getCollection(collection).doc(id).get());
	}

	/**
	 * Subscribe to realtime changes to a single item via a Firestore `onSnapshot` listener.
	 *
	 * @param c The collection the item belongs to.
	 * @param id The ID of the item to subscribe to.
	 * @returns An async sequence yielding the item (or `undefined` when absent) on every change.
	 * @example for await (const item of provider.getItemSequence(users, "abc123")) console.log(item)
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/getItemSequence
	 */
	override getItemSequence<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		const ref = this._getCollection(c).doc(id);
		const sequence = new DeferredSequence<OptionalItem<II, TT>>();
		return new LazySequence(sequence, () =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getOptionalItem<II, TT>(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}

	/**
	 * Add an item to a collection, letting Firestore generate its document ID.
	 *
	 * @param c The collection to add the item to.
	 * @param data The data for the new item.
	 * @returns Promise resolving to the generated ID of the new item.
	 * @example const id = await provider.addItem(users, { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>(c: Collection<string, II, TT>, data: TT): Promise<II> {
		return (await this._getCollection(c).add(data)).id as II; // `as II` needed: Firestore returns string, not II.
	}

	/**
	 * Write an item by ID, overwriting any existing document.
	 *
	 * @param c The collection the item belongs to.
	 * @param id The ID of the item to write.
	 * @param data The data to store for the item.
	 * @returns Promise resolving once the write completes.
	 * @example await provider.setItem(users, "abc123", { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/setItem
	 */
	override async setItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await this._getCollection(c).doc(id).set(data);
	}

	/**
	 * Apply partial updates to a single item, translating them into Firestore `FieldValue` operations.
	 *
	 * @param c The collection the item belongs to.
	 * @param id The ID of the item to update.
	 * @param updates The updates to apply to the item.
	 * @returns Promise resolving once the update completes.
	 * @example await provider.updateItem(users, "abc123", { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/updateItem
	 */
	override async updateItem<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await this._getCollection(c).doc(id).update(_getFieldValues(updates));
	}

	/**
	 * Delete a single item by ID from its collection.
	 *
	 * @param c The collection the item belongs to.
	 * @param id The ID of the item to delete.
	 * @returns Promise resolving once the deletion completes.
	 * @example await provider.deleteItem(users, "abc123")
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/deleteItem
	 */
	override async deleteItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): Promise<void> {
		await this._getCollection(c).doc(id).delete();
	}

	/**
	 * Count the items matching a query using Firestore's server-side aggregation.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to count; counts the whole collection when omitted.
	 * @returns Promise resolving to the number of matching items.
	 * @example const total = await provider.countQuery(users)
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/countQuery
	 */
	override async countQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<number> {
		const snapshot = await this._getQuery(c, q).count().get();
		return snapshot.data().count;
	}

	/**
	 * Read all items matching a query.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to read; reads the whole collection when omitted.
	 * @returns Promise resolving to the array of matching items.
	 * @example const items = await provider.getQuery(users, { "name": "Dave" })
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/getQuery
	 */
	override async getQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		return _getItems<II, TT>(await this._getQuery(c, q).get());
	}

	/**
	 * Subscribe to realtime changes to a query via a Firestore `onSnapshot` listener.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to subscribe to; subscribes to the whole collection when omitted.
	 * @returns An async sequence yielding the matching items on every change.
	 * @example for await (const items of provider.getQuerySequence(users)) console.log(items)
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/getQuerySequence
	 */
	override getQuerySequence<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): ItemsSequence<II, TT> {
		const ref = this._getQuery(c, q);
		const sequence = new DeferredSequence<Items<II, TT>>();
		return new LazySequence(sequence, () =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getItems<II, TT>(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}

	/**
	 * Write the same data to every item matching a query, batched through a Firestore `BulkWriter`.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to write.
	 * @param data The data to write to each matching item.
	 * @returns Promise resolving once all writes complete.
	 * @example await provider.setQuery(users, { "name": "Dave" }, { active: false })
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/setQuery
	 */
	override async setQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>, data: TT): Promise<void> {
		return await this._bulkWrite(c, q, (w, s) => void w.set(s.ref, data));
	}

	/**
	 * Apply the same partial updates to every item matching a query, batched through a Firestore `BulkWriter`.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to update.
	 * @param updates The updates to apply to each matching item.
	 * @returns Promise resolving once all updates complete.
	 * @example await provider.updateQuery(users, { "active": true }, { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/updateQuery
	 */
	override async updateQuery<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		q: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		const fieldValues = _getFieldValues(updates);
		return await this._bulkWrite(c, q, (w, s) => void w.update(s.ref, fieldValues));
	}

	/**
	 * Delete every item matching a query, batched through a Firestore `BulkWriter`.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to delete.
	 * @returns Promise resolving once all deletions complete.
	 * @example await provider.deleteQuery(users, { "active": false })
	 * @see https://dhoulb.github.io/shelving/firestore/server/FirestoreServerProvider/FirestoreServerProvider/deleteQuery
	 */
	override async deleteQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>): Promise<void> {
		return await this._bulkWrite(c, q, (w, s) => void w.delete(s.ref));
	}
}
