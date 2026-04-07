import type {
	CollectionReference,
	DocumentReference,
	DocumentSnapshot,
	Firestore,
	Query,
	QueryConstraint,
	QueryDocumentSnapshot,
	UpdateData,
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
import { joinDataKey } from "../../util/data.js";
import type { Item, Items, OptionalItem } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { getObject } from "../../util/object.js";
import type { ItemQuery } from "../../util/query.js";
import { getQueryFilters, getQueryLimit, getQueryOrders } from "../../util/query.js";
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

/** Create a corresponding `QueryReference` from a Query. */
function _getQuery<T extends Data>(firestore: Firestore, c: string, q?: ItemQuery<string, T>): Query<T> {
	return q ? (query(collection(firestore, c), ..._getConstraints(q)) as Query<T>) : (collection(firestore, c) as CollectionReference<T>);
}
function* _getConstraints<T extends Data>(q: ItemQuery<string, T>): Iterable<QueryConstraint> {
	for (const { key, direction } of getQueryOrders(q)) {
		const k = joinDataKey(key);
		yield orderBy(k === "id" ? ID : k, direction);
	}
	for (const { key, operator, value } of getQueryFilters(q)) {
		const k = joinDataKey(key);
		yield where(k === "id" ? ID : k, OPERATORS[operator], value);
	}
	const l = getQueryLimit(q);
	if (typeof l === "number") yield limit(l);
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
	const k = joinDataKey(key);
	if (action === "set") return [k, value];
	if (action === "sum") return [k, increment(value)];
	if (action === "with") return [k, arrayUnion(...value)];
	if (action === "omit") return [k, arrayRemove(...value)];
	return action; // Never happens.
}

/**
 * Firestore Lite client database provider.
 * - Works with the Firebase JS SDK.
 * - Does not support offline mode.
 * - Does not support realtime subscriptions.
 */
export class FirestoreLiteProvider extends DBProvider<string> {
	private readonly _firestore: Firestore;
	constructor(firestore: Firestore) {
		super();
		this._firestore = firestore;
	}
	async getItem<T extends Data>({ name }: Collection<string, string, T>, id: string): Promise<OptionalItem<string, T>> {
		const snapshot = await getDoc(doc(this._firestore, name, id) as DocumentReference<T>);
		return _getOptionalItem(snapshot);
	}
	getItemSequence<T extends Data>(_c: Collection<string, string, T>, _id: string): AsyncIterableIterator<OptionalItem<string, T>> {
		throw new UnimplementedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	async addItem<T extends Data>({ name }: Collection<string, string, T>, data: T): Promise<string> {
		const reference = await addDoc(collection(this._firestore, name), data);
		return reference.id;
	}
	async setItem<T extends Data>({ name }: Collection<string, string, T>, id: string, data: T): Promise<void> {
		await setDoc(doc(this._firestore, name, id), data);
	}
	async updateItem<T extends Data>({ name }: Collection<string, string, T>, id: string, updates: Updates<T>): Promise<void> {
		await updateDoc(doc(this._firestore, name, id), _getFieldValues(updates));
	}
	async deleteItem<T extends Data>({ name }: Collection<string, string, T>, id: string): Promise<void> {
		await deleteDoc(doc(this._firestore, name, id));
	}
	override async countQuery<T extends Data>({ name }: Collection<string, string, T>, q?: ItemQuery<string, T>): Promise<number> {
		const snapshot = await getCount(_getQuery(this._firestore, name, q));
		return snapshot.data().count;
	}
	async getQuery<T extends Data>({ name }: Collection<string, string, T>, q?: ItemQuery<string, T>): Promise<Items<string, T>> {
		const snapshot = await getDocs(_getQuery(this._firestore, name, q));
		return snapshot.docs.map(_getItem);
	}
	getQuerySequence<T extends Data>(_c: Collection<string, string, T>, _q?: ItemQuery<string, T>): AsyncIterableIterator<Items<string, T>> {
		throw new UnimplementedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	async setQuery<T extends Data>({ name }: Collection<string, string, T>, q: ItemQuery<string, T>, data: T): Promise<void> {
		const snapshot = await getDocs(_getQuery(this._firestore, name, q));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
	}
	async updateQuery<T extends Data>({ name }: Collection<string, string, T>, q: ItemQuery<string, T>, updates: Updates<T>): Promise<void> {
		const snapshot = await getDocs(_getQuery(this._firestore, name, q));
		const fieldValues = _getFieldValues(updates);
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, fieldValues)));
	}
	async deleteQuery<T extends Data>({ name }: Collection<string, string, T>, q: ItemQuery<string, T>): Promise<void> {
		const snapshot = await getDocs(_getQuery(this._firestore, name, q));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
