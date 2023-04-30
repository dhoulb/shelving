import type { ItemArray, ItemData, ItemQuery, ItemValue } from "../../db/ItemReference.js";
import type { AsyncProvider } from "../../provider/Provider.js";
import type { Data } from "../../util/data.js";
import type { ImmutableObject, ObjectProp } from "../../util/object.js";
import type { Update, Updates } from "../../util/update.js";
import type { DocumentSnapshot, Firestore, Query, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot } from "firebase/firestore";
import { addDoc, collection, deleteDoc, doc, documentId, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { LazyDeferredSequence } from "../../sequence/LazyDeferredSequence.js";
import { getObject } from "../../util/object.js";
import { getFilters, getSorts } from "../../util/query.js";
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

/** Get a Firestore QueryReference for a given query. */
function _getQuery(firestore: Firestore, c: string, q: ItemQuery): Query {
	return query(collection(firestore, c), ..._getConstraints(q));
}
function* _getConstraints(q: ItemQuery): Iterable<QueryConstraint> {
	for (const { keys, direction } of getSorts(q)) {
		const key = keys.join(".");
		yield orderBy(key === "id" ? ID : key, direction);
	}
	for (const { keys, operator, value } of getFilters(q)) {
		const key = keys.join(".");
		yield where(key === "id" ? ID : key, OPERATORS[operator], value);
	}
	if (typeof q.$limit === "number") yield limit(q.$limit);
}

function _getItems<T extends Data>(snapshot: QuerySnapshot<T>): ItemArray<T> {
	return snapshot.docs.map(_getItemData);
}

function _getItemData<T extends Data>(snapshot: QueryDocumentSnapshot<T>): ItemData<T> {
	const data = snapshot.data();
	return { ...data, id: snapshot.id };
}

function _getItemValue<T extends Data>(snapshot: DocumentSnapshot<T>): ItemValue<T> {
	const data = snapshot.data();
	return data ? { ...data, id: snapshot.id } : null;
}

/** Convert `Updates` object into corresponding Firestore `FieldValue` instances. */
const _getFieldValues = <T extends Data>(updates: Updates<T>): ImmutableObject => getObject(mapItems(getUpdates(updates), _getFieldValue));
const _getFieldValue = ({ keys, action, value }: Update): ObjectProp => [keys.join("."), action === "sum" ? increment(value) : action === "set" ? value : action];

/**
 * Firestore client database provider.
 * - Works with the Firebase JS SDK.
 * - Supports offline mode.
 * - Supports realtime subscriptions.
 */
export class FirestoreClientProvider implements AsyncProvider {
	private readonly _firestore: Firestore;
	constructor(firestore: Firestore) {
		this._firestore = firestore;
	}
	async getItem(c: string, id: string): Promise<ItemValue> {
		return _getItemValue(await getDoc(doc(this._firestore, c, id)));
	}
	getItemSequence(c: string, id: string): AsyncIterable<ItemValue> {
		return new LazyDeferredSequence(({ resolve, reject }) =>
			onSnapshot(
				doc(this._firestore, c, id), //
				snapshot => resolve(_getItemValue(snapshot)),
				reject,
			),
		);
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
		return _getItems(await getDocs(_getQuery(this._firestore, c, q)));
	}
	getQuerySequence(c: string, q: ItemQuery): AsyncIterable<ItemArray> {
		return new LazyDeferredSequence(({ resolve, reject }) =>
			onSnapshot(
				_getQuery(this._firestore, c, q), //
				snapshot => resolve(_getItems(snapshot)),
				reject,
			),
		);
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
