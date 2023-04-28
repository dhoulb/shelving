import type { ItemArray, ItemData, ItemStatement, ItemValue } from "../../db/Item.js";
import type { AsyncProvider } from "../../provider/Provider.js";
import type { Data } from "../../util/data.js";
import type { ImmutableObject, ObjectProp } from "../../util/object.js";
import type { PropUpdate, Updates } from "../../util/update.js";
import type { DocumentSnapshot, Firestore, Query, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot } from "firebase/firestore";
import { addDoc, deleteDoc, doc, documentId, collection as getCollection, getDoc, getDocs, limit as getLimit, query as getQuery, increment, onSnapshot, orderBy, setDoc, updateDoc, where } from "firebase/firestore";
import { LazyDeferredSequence } from "../../sequence/LazyDeferredSequence.js";
import { getObject } from "../../util/object.js";
import { mapItems } from "../../util/transform.js";
import { getUpdates } from "../../util/update.js";

// Constants.
const ID = documentId();

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

/** Get a Firestore QueryReference for a given query. */
function _getQuery(firestore: Firestore, collection: string, constraints: ItemStatement): Query {
	return getQuery(getCollection(firestore, collection), ..._getConstraints(constraints));
}
function* _getConstraints({ sorts, filters, limit }: ItemStatement): Iterable<QueryConstraint> {
	for (const { key, direction } of sorts) yield orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) yield where(key, OPERATORS[operator], value);
	if (typeof limit === "number") yield getLimit(limit);
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
const _getFieldValue = ({ keys, type, value }: PropUpdate): ObjectProp => [keys.join("."), type === "sum" ? increment(value) : type === "set" ? value : type];

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
	async getItem(collection: string, id: string): Promise<ItemValue> {
		return _getItemValue(await getDoc(doc(this._firestore, collection, id)));
	}
	getItemSequence(collection: string, id: string): AsyncIterable<ItemValue> {
		return new LazyDeferredSequence(({ resolve, reject }) =>
			onSnapshot(
				doc(this._firestore, collection, id), //
				snapshot => resolve(_getItemValue(snapshot)),
				reject,
			),
		);
	}
	async addItem(collection: string, data: Data): Promise<string> {
		const reference = await addDoc(getCollection(this._firestore, collection), data);
		return reference.id;
	}
	async setItem(collection: string, id: string, data: Data): Promise<void> {
		await setDoc(doc(this._firestore, collection, id), data);
	}
	async updateItem(collection: string, id: string, updates: Updates): Promise<void> {
		await updateDoc(doc(this._firestore, collection, id), _getFieldValues(updates));
	}
	async deleteItem(collection: string, id: string): Promise<void> {
		await deleteDoc(doc(this._firestore, collection, id));
	}
	async getQuery(collection: string, constraints: ItemStatement): Promise<ItemArray> {
		return _getItems(await getDocs(_getQuery(this._firestore, collection, constraints)));
	}
	getQuerySequence(collection: string, constraints: ItemStatement): AsyncIterable<ItemArray> {
		return new LazyDeferredSequence(({ resolve, reject }) =>
			onSnapshot(
				_getQuery(this._firestore, collection, constraints), //
				snapshot => resolve(_getItems(snapshot)),
				reject,
			),
		);
	}
	async setQuery(collection: string, constraints: ItemStatement, data: Data): Promise<number> {
		const snapshot = await getDocs(_getQuery(this._firestore, collection, constraints));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
		return snapshot.size;
	}
	async updateQuery(collection: string, constraints: ItemStatement, updates: Updates): Promise<number> {
		const snapshot = await getDocs(_getQuery(this._firestore, collection, constraints));
		const fieldValues = _getFieldValues(updates);
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, fieldValues)));
		return snapshot.size;
	}
	async deleteQuery(collection: string, constraints: ItemStatement): Promise<number> {
		const snapshot = await getDocs(_getQuery(this._firestore, collection, constraints));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
		return snapshot.size;
	}
}
