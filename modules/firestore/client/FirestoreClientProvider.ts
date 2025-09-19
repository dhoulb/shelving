import type {
	CollectionReference,
	DocumentReference,
	DocumentSnapshot,
	Firestore,
	Query,
	QueryConstraint,
	QueryDocumentSnapshot,
	QuerySnapshot,
	UpdateData,
} from "firebase/firestore";
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	documentId,
	getCountFromServer,
	getDoc,
	getDocs,
	increment,
	limit,
	onSnapshot,
	orderBy,
	query,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import { AsyncProvider } from "../../db/Provider.js";
import { LazyDeferredSequence } from "../../sequence/LazyDeferredSequence.js";
import type { Data, DataKey, DataProp, Database } from "../../util/data.js";
import type { Item, Items, OptionalItem } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { getObject } from "../../util/object.js";
import type { ItemQuery } from "../../util/query.js";
import { getFilters, getLimit, getOrders } from "../../util/query.js";
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

/** Get a Firestore QueryReference for a given query. */
function _getQuery<T extends Database, K extends DataKey<T>>(firestore: Firestore, c: K, q?: ItemQuery<string, T[K]>): Query<T[K]> {
	return q
		? (query(collection(firestore, c), ..._getConstraints(q)) as Query<T[K]>)
		: (collection(firestore, c) as CollectionReference<T[K]>);
}
function* _getConstraints<T extends Data>(q: ItemQuery<string, T>): Iterable<QueryConstraint> {
	for (const { key, direction } of getOrders(q)) yield orderBy(key === "id" ? ID : key, direction);
	for (const { key, operator, value } of getFilters(q)) yield where(key === "id" ? ID : key, OPERATORS[operator], value);
	const l = getLimit(q);
	if (typeof l === "number") yield limit(l);
}

function _getItems<T extends Data>(snapshot: QuerySnapshot<T>): Items<string, T> {
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

/** Convert `Updates` object into corresponding Firestore `FieldValue` instances. */
function _getFieldValues<T extends Data>(updates: Updates<T>): UpdateData<T> {
	return getObject(mapItems(getUpdates(updates), _getFieldValue)) as UpdateData<T>;
}
function _getFieldValue({ key, action, value }: Update): DataProp<Data> {
	if (action === "set") return [key, value];
	if (action === "sum") return [key, increment(value)];
	if (action === "with") return [key, arrayUnion(...value)];
	if (action === "omit") return [key, arrayRemove(...value)];
	return action; // Never happens.
}

/**
 * Firestore client database provider.
 * - Works with the Firebase JS SDK.
 * - Supports offline mode.
 * - Supports realtime subscriptions.
 */
export class FirestoreClientProvider<T extends Database> extends AsyncProvider<string, T> {
	private readonly _firestore: Firestore;
	constructor(firestore: Firestore) {
		super();
		this._firestore = firestore;
	}
	async getItem<K extends DataKey<T>>(c: K, id: string): Promise<OptionalItem<string, T[K]>> {
		const snapshot = await getDoc(doc(this._firestore, c, id) as DocumentReference<T[K]>);
		return _getOptionalItem(snapshot);
	}
	getItemSequence<K extends DataKey<T>>(c: K, id: string): AsyncIterable<OptionalItem<string, T[K]>> {
		return new LazyDeferredSequence(sequence =>
			onSnapshot(
				doc(this._firestore, c, id) as DocumentReference<T[K]>, //
				snapshot => sequence.resolve(_getOptionalItem(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}
	async addItem<K extends DataKey<T>>(c: K, data: Data): Promise<string> {
		const reference = await addDoc(collection(this._firestore, c), data);
		return reference.id;
	}
	async setItem<K extends DataKey<T>>(c: K, id: string, data: Data): Promise<void> {
		await setDoc(doc(this._firestore, c, id), data);
	}
	async updateItem<K extends DataKey<T>>(c: K, id: string, updates: Updates<T[K]>): Promise<void> {
		await updateDoc(doc(this._firestore, c, id), _getFieldValues(updates));
	}
	async deleteItem<K extends DataKey<T>>(c: K, id: string): Promise<void> {
		await deleteDoc(doc(this._firestore, c, id));
	}
	override async countQuery<K extends DataKey<T>>(c: K, q?: ItemQuery<string, T[K]>): Promise<number> {
		const snapshot = await getCountFromServer(_getQuery(this._firestore, c, q));
		return snapshot.data().count;
	}
	async getQuery<K extends DataKey<T>>(c: K, q?: ItemQuery<string, T[K]>): Promise<Items<string, T[K]>> {
		return _getItems(await getDocs(_getQuery(this._firestore, c, q)));
	}
	getQuerySequence<K extends DataKey<T>>(c: K, q?: ItemQuery<string, T[K]>): AsyncIterable<Items<string, T[K]>> {
		return new LazyDeferredSequence(sequence =>
			onSnapshot(
				_getQuery(this._firestore, c, q), //
				snapshot => sequence.resolve(_getItems(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}
	async setQuery<K extends DataKey<T>>(c: K, q: ItemQuery<string, T[K]>, data: Data): Promise<void> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
	}
	async updateQuery<K extends DataKey<T>>(c: K, q: ItemQuery<string, T[K]>, updates: Updates<T[K]>): Promise<void> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		const fieldValues = _getFieldValues(updates);
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, fieldValues)));
	}
	async deleteQuery<K extends DataKey<T>>(c: K, q: ItemQuery<string, T[K]>): Promise<void> {
		const snapshot = await getDocs(_getQuery(this._firestore, c, q));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
