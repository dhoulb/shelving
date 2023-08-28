import type { AsyncProvider } from "../../db/Provider.js";
import type { Data, DataKey, DataProp, Database } from "../../util/data.js";
import type { Item, ItemQuery, Items, OptionalItem } from "../../util/item.js";
import type { Update, Updates } from "../../util/update.js";
import type { CollectionReference, DocumentReference, DocumentSnapshot, Firestore, Query, QueryConstraint, QueryDocumentSnapshot, UpdateData } from "firebase/firestore/lite";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, documentId, getCount, getDoc, getDocs, increment, limit, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore/lite";
import { UnsupportedError } from "../../error/UnsupportedError.js";
import { getItem } from "../../util/item.js";
import { getObject } from "../../util/object.js";
import { getFilters, getLimit, getOrders } from "../../util/query.js";
import { mapItems } from "../../util/transform.js";
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

/** Create a corresponding `QueryReference` from a Query. */
function _getQuery<T extends Database, K extends DataKey<T>>(firestore: Firestore, c: K, q?: ItemQuery<T[K]>): Query<T[K]> {
	return q ? (query(collection(firestore, c), ..._getConstraints(q)) as Query<T[K]>) : (collection(firestore, c) as CollectionReference<T[K]>);
}
function* _getConstraints<T extends Data>(q: ItemQuery<T>): Iterable<QueryConstraint> {
	for (const { key, direction } of getOrders(q)) yield orderBy(key === "id" ? ID : key, direction);
	for (const { key, operator, value } of getFilters(q)) yield where(key === "id" ? ID : key, OPERATORS[operator], value);
	const l = getLimit(q);
	if (typeof l === "number") yield limit(l);
}

function _getItem<T extends Data>(snapshot: QueryDocumentSnapshot<T>): Item<T> {
	const data = snapshot.data();
	return getItem(snapshot.id, data);
}

function _getOptionalItem<T extends Data>(snapshot: DocumentSnapshot<T>): OptionalItem<T> {
	const data = snapshot.data();
	if (data) return getItem(snapshot.id, data);
}

/** Convert `Updates` object into corresponding Firestore `FieldValue` instances. */
function _getFieldValues<T extends Data>(updates: Updates<T>): UpdateData<T> {
	return getObject(mapItems(getUpdates(updates), _getFieldValue)) as UpdateData<T>;
}
function _getFieldValue({ key, action, value }: Update): DataProp<Data> {
	if (action === "set") return [key, value];
	if (action === "sum") return [key, increment(value)];
	if (action === "with") return [key, arrayUnion(value)];
	if (action === "omit") return [key, arrayRemove(value)];
	return action; // Never happens.
}

/**
 * Firestore Lite client database provider.
 * - Works with the Firebase JS SDK.
 * - Does not support offline mode.
 * - Does not support realtime subscriptions.
 */
export class FirestoreLiteProvider<T extends Database> implements AsyncProvider<T> {
	private readonly _firestore: Firestore;
	constructor(firestore: Firestore) {
		this._firestore = firestore;
	}
	async getItem<K extends DataKey<T>>(c: K, id: string): Promise<OptionalItem<T[K]>> {
		const snapshot = await getDoc(doc(this._firestore, c, id) as DocumentReference<T[K]>);
		return _getOptionalItem(snapshot);
	}
	getItemSequence<K extends DataKey<T>>(): AsyncIterableIterator<OptionalItem<T[K]>> {
		throw new UnsupportedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	async addItem<K extends DataKey<T>>(c: K, data: Data): Promise<string> {
		const reference = await addDoc(collection(this._firestore, c), data);
		return reference.id;
	}
	async setItem<K extends DataKey<T>>(c: K, id: string, data: Data): Promise<void> {
		await setDoc(doc(this._firestore, c, id), data);
	}
	async updateItem<K extends DataKey<T>>(c: K, id: string, updates: Updates): Promise<void> {
		await updateDoc(doc(this._firestore, c, id), _getFieldValues(updates));
	}
	async deleteItem<K extends DataKey<T>>(c: K, id: string): Promise<void> {
		await deleteDoc(doc(this._firestore, c, id));
	}
	async countQuery<K extends DataKey<T>>(c: K, q?: ItemQuery<T[K]>): Promise<number> {
		const snapshot = await getCount(_getQuery(this._firestore, c, q));
		return snapshot.data().count;
	}
	async getQuery<K extends DataKey<T>>(c: K, q?: ItemQuery<T[K]>): Promise<Items<T[K]>> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		return snapshot.docs.map(_getItem);
	}
	getQuerySequence<K extends DataKey<T>>(): AsyncIterableIterator<Items<T[K]>> {
		throw new UnsupportedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	async setQuery<K extends DataKey<T>>(c: K, q: ItemQuery<T[K]>, data: Data): Promise<void> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
	}
	async updateQuery<K extends DataKey<T>>(c: K, q: ItemQuery<T[K]>, updates: Updates): Promise<void> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		const fieldValues = _getFieldValues<T[K]>(updates);
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, fieldValues)));
	}
	async deleteQuery<K extends DataKey<T>>(c: K, q: ItemQuery<T[K]>): Promise<void> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
