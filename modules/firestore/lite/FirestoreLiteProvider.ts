import type {
	Firestore,
	CollectionReference as FirestoreCollectionReference,
	DocumentReference as FirestoreDocumentReference,
	DocumentSnapshot as FirestoreDocumentSnapshot,
	QueryConstraint as FirestoreQueryConstraint,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	Query as FirestoreQueryReference,
	QuerySnapshot as FirestoreQuerySnapshot,
	UpdateData as FirestoreUpdateData,
} from "firebase/firestore/lite";
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	documentId,
	getCount,
	getDoc,
	getDocs,
	increment,
	limit,
	orderBy,
	query,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore/lite";
import type { Collection } from "../../db/collection/Collection.js";
import { DBProvider } from "../../db/provider/DBProvider.js";
import { UnimplementedError } from "../../error/UnimplementedError.js";
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
const ID = documentId();

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

function* _getConstraints<II extends string, TT extends Data>(q: Query<Item<II, TT>>): Iterable<FirestoreQueryConstraint> {
	for (const { key, direction } of getQueryOrders(q)) {
		const k = joinDataPath(key);
		yield orderBy(k === "id" ? ID : k, direction);
	}
	for (const { key, operator, value } of getQueryFilters(q)) {
		const k = joinDataPath(key);
		yield where(k === "id" ? ID : k, OPERATORS[operator], value);
	}
	const l = getQueryLimit(q);
	if (typeof l === "number") yield limit(l);
}

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

/** Convert `Updates` object into corresponding Firestore `FieldValue` instances. */
function _getFieldValues<TT extends Data>(updates: Updates<TT>): FirestoreUpdateData<TT> {
	return getObject(mapItems(getUpdates(updates), _getFieldValue)) as FirestoreUpdateData<TT>;
}
function _getFieldValue({ key, action, value }: Update): DataProp<Data> {
	const k = joinDataPath(key);
	if (action === "set") return [k, value];
	if (action === "sum") return [k, increment(value)];
	if (action === "with") return [k, arrayUnion(...value)];
	if (action === "omit") return [k, arrayRemove(...value)];
	return action; // Never happens.
}

/**
 * Cloud Firestore database provider backed by the Firebase Lite SDK, implementing the `DBProvider` abstraction.
 *
 * - Works with the Firebase JS SDK via `firebase/firestore/lite`, which keeps bundle size small.
 * - Does not support offline mode.
 * - Does not support realtime subscriptions: `getItemSequence()` and `getQuerySequence()` throw `UnimplementedError`.
 *
 * @example
 * import { getFirestore } from "firebase/firestore/lite";
 * const provider = new FirestoreLiteProvider(getFirestore());
 *
 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider
 */
export class FirestoreLiteProvider<I extends string = string, T extends Data = Data> extends DBProvider<I, T> {
	private readonly _firestore: Firestore;

	/**
	 * Create a provider wrapping a Firebase Lite `Firestore` instance.
	 *
	 * @param firestore The `Firestore` instance to read and write through.
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider
	 */
	constructor(firestore: Firestore) {
		super();
		this._firestore = firestore;
	}

	/** Get a Firestore CollectionReference for a given collection. */
	private _collection<II extends I, TT extends T>({ name }: Collection<string, II, TT>): FirestoreCollectionReference<TT> {
		return collection(this._firestore, name) as FirestoreCollectionReference<TT>;
	}

	/** Get a Firestore DocumentReference for a given document. */
	private _doc<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): FirestoreDocumentReference<TT> {
		return doc(this._collection(c), id);
	}

	/** Get a Firestore QueryReference for a given query. */
	private _query<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): FirestoreQueryReference<TT> {
		return q ? query(this._collection(c), ..._getConstraints(q)) : this._collection(c);
	}

	/**
	 * Read a single item by ID from its Firestore document.
	 *
	 * @param c The collection the item belongs to.
	 * @param id The ID of the item to read.
	 * @returns Promise resolving to the item, or `undefined` if the document does not exist.
	 * @example await provider.getItem(users, "abc123")
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/getItem
	 */
	override async getItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const snapshot = await getDoc(this._doc(c, id));
		return _getOptionalItem<II, TT>(snapshot);
	}
	/**
	 * Not supported — the Firebase Lite SDK has no realtime listeners.
	 *
	 * @param _c The collection the item belongs to.
	 * @param _id The ID of the item to subscribe to.
	 * @returns Never returns normally.
	 * @throws {UnimplementedError} Always, because Firestore Lite does not support realtime subscriptions.
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/getItemSequence
	 */
	override getItemSequence<II extends I, TT extends T>(_c: Collection<string, II, TT>, _id: II): OptionalItemSequence<II, TT> {
		throw new UnimplementedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	/**
	 * Add an item to a collection, letting Firestore generate its document ID.
	 *
	 * @param c The collection to add the item to.
	 * @param data The data for the new item.
	 * @returns Promise resolving to the generated ID of the new item.
	 * @example const id = await provider.addItem(users, { name: "Dave" })
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>(c: Collection<string, II, TT>, data: TT): Promise<II> {
		const reference = await addDoc(this._collection(c), data);
		return reference.id as II; // `as II` needed: Firestore returns string, not II.
	}
	/**
	 * Write an item by ID, overwriting any existing document.
	 *
	 * @param c The collection the item belongs to.
	 * @param id The ID of the item to write.
	 * @param data The data to store for the item.
	 * @returns Promise resolving once the write completes.
	 * @example await provider.setItem(users, "abc123", { name: "Dave" })
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/setItem
	 */
	override async setItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await setDoc(this._doc(c, id), data);
	}
	/**
	 * Apply partial updates to a single item, translating them into Firestore `FieldValue` operations.
	 *
	 * @param c The collection the item belongs to.
	 * @param id The ID of the item to update.
	 * @param updates The updates to apply to the item.
	 * @returns Promise resolving once the update completes.
	 * @example await provider.updateItem(users, "abc123", { name: "Dave" })
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/updateItem
	 */
	override async updateItem<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await updateDoc(this._doc(c, id), _getFieldValues(updates));
	}
	/**
	 * Delete a single item by ID from its collection.
	 *
	 * @param c The collection the item belongs to.
	 * @param id The ID of the item to delete.
	 * @returns Promise resolving once the deletion completes.
	 * @example await provider.deleteItem(users, "abc123")
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/deleteItem
	 */
	override async deleteItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): Promise<void> {
		await deleteDoc(this._doc(c, id));
	}
	/**
	 * Count the items matching a query using Firestore's server-side aggregation.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to count; counts the whole collection when omitted.
	 * @returns Promise resolving to the number of matching items.
	 * @example const total = await provider.countQuery(users)
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/countQuery
	 */
	override async countQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<number> {
		const snapshot = await getCount(this._query(c, q));
		return snapshot.data().count;
	}
	/**
	 * Read all items matching a query.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to read; reads the whole collection when omitted.
	 * @returns Promise resolving to the array of matching items.
	 * @example const items = await provider.getQuery(users, { "name": "Dave" })
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/getQuery
	 */
	override async getQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		return _getItems<II, TT>(await getDocs(this._query(c, q)));
	}
	/**
	 * Not supported — the Firebase Lite SDK has no realtime listeners.
	 *
	 * @param _c The collection to query.
	 * @param _q The query to subscribe to.
	 * @returns Never returns normally.
	 * @throws {UnimplementedError} Always, because Firestore Lite does not support realtime subscriptions.
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/getQuerySequence
	 */
	override getQuerySequence<II extends I, TT extends T>(_c: Collection<string, II, TT>, _q?: Query<Item<II, TT>>): ItemsSequence<II, TT> {
		throw new UnimplementedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	/**
	 * Write the same data to every item matching a query, one `setDoc` per matching document.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to write.
	 * @param data The data to write to each matching item.
	 * @returns Promise resolving once all writes complete.
	 * @example await provider.setQuery(users, { "name": "Dave" }, { active: false })
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/setQuery
	 */
	override async setQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>, data: TT): Promise<void> {
		const snapshot = await getDocs(this._query(c, q));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
	}
	/**
	 * Apply the same partial updates to every item matching a query, one `updateDoc` per matching document.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to update.
	 * @param updates The updates to apply to each matching item.
	 * @returns Promise resolving once all updates complete.
	 * @example await provider.updateQuery(users, { "active": true }, { name: "Dave" })
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/updateQuery
	 */
	override async updateQuery<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		q: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		const snapshot = await getDocs(this._query(c, q));
		const fieldValues = _getFieldValues(updates);
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, fieldValues)));
	}
	/**
	 * Delete every item matching a query, one `deleteDoc` per matching document.
	 *
	 * @param c The collection to query.
	 * @param q The query selecting which items to delete.
	 * @returns Promise resolving once all deletions complete.
	 * @example await provider.deleteQuery(users, { "active": false })
	 * @see https://shelving.cc/firestore/lite/FirestoreLiteProvider/deleteQuery
	 */
	override async deleteQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>): Promise<void> {
		const snapshot = await getDocs(this._query(c, q));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
