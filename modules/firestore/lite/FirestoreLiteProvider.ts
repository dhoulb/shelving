import type { ItemArray, ItemData, ItemQuery, ItemValue } from "../../db/ItemReference.js";
import type { AsyncProvider } from "../../provider/Provider.js";
import type { Data, DataProp } from "../../util/data.js";
import type { ImmutableObject } from "../../util/object.js";
import type { Update, Updates } from "../../util/update.js";
import type { DocumentSnapshot, Firestore, Query, QueryConstraint, QueryDocumentSnapshot } from "firebase/firestore/lite";
import { addDoc, collection, deleteDoc, doc, documentId, getDoc, getDocs, increment, limit, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore/lite";
import { getItemData } from "../../db/ItemReference.js";
import { UnsupportedError } from "../../error/UnsupportedError.js";
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
function _getQuery(firestore: Firestore, c: string, q: ItemQuery): Query {
	return query(collection(firestore, c), ..._getConstraints(q));
}
function* _getConstraints(q: ItemQuery): Iterable<QueryConstraint> {
	for (const { key, direction } of getOrders(q)) yield orderBy(key === "id" ? ID : key, direction);
	for (const { key, operator, value } of getFilters(q)) yield where(key === "id" ? ID : key, OPERATORS[operator], value);
	const l = getLimit(q);
	if (typeof l === "number") yield limit(l);
}

function _getItemData(snapshot: QueryDocumentSnapshot): ItemData {
	const data = snapshot.data();
	return getItemData(snapshot.id, data);
}

function _getItemValue(snapshot: DocumentSnapshot): ItemValue {
	const data = snapshot.data();
	if (data) return getItemData(snapshot.id, data);
}

/** Convert `Updates` object into corresponding Firestore `FieldValue` instances. */
const _getFieldValues = <T extends Data>(updates: Updates<T>): ImmutableObject => getObject(mapItems(getUpdates(updates), _getFieldValue));
const _getFieldValue = ({ key, action, value }: Update): DataProp<Data> => [key, action === "sum" ? increment(value) : action === "set" ? value : action];

/**
 * Firestore Lite client database provider.
 * - Works with the Firebase JS SDK.
 * - Does not support offline mode.
 * - Does not support realtime subscriptions.
 */
export class FirestoreLiteProvider implements AsyncProvider {
	private readonly _firestore: Firestore;
	constructor(firestore: Firestore) {
		this._firestore = firestore;
	}
	async getItem(c: string, id: string): Promise<ItemValue> {
		return _getItemValue(await getDoc(doc(this._firestore, c, id)));
	}
	getItemSequence(): AsyncIterableIterator<ItemValue> {
		throw new UnsupportedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	async addItem(c: string, data: Data): Promise<string> {
		const reference = await addDoc(collection(this._firestore, c), data);
		return reference.id;
	}
	async setItem(c: string, id: string, data: Data): Promise<void> {
		await setDoc(doc(this._firestore, c, id), data);
	}
	async updateItem(c: string, id: string, updates: Updates): Promise<void> {
		await updateDoc(doc(this._firestore, c, id), _getFieldValues(updates));
	}
	async deleteItem(c: string, id: string): Promise<void> {
		await deleteDoc(doc(this._firestore, c, id));
	}
	async getQuery(c: string, q: ItemQuery): Promise<ItemArray> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		return snapshot.docs.map(_getItemData);
	}
	getQuerySequence(): AsyncIterableIterator<ItemArray> {
		throw new UnsupportedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	async setQuery(c: string, q: ItemQuery, data: Data): Promise<number> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
		return snapshot.size;
	}
	async updateQuery(c: string, q: ItemQuery, updates: Updates): Promise<number> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		const fieldValues = _getFieldValues(updates);
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, fieldValues)));
		return snapshot.size;
	}
	async deleteQuery(c: string, q: ItemQuery): Promise<number> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
		return snapshot.size;
	}
}
