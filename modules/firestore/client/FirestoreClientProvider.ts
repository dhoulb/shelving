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
import type { Collection } from "../../db/collection/Collection.js";
import { DBProvider } from "../../db/provider/DBProvider.js";
import { LazyDeferredSequence } from "../../sequence/LazyDeferredSequence.js";
import type { Data, DataProp } from "../../util/data.js";
import { joinDataKey } from "../../util/data.js";
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
	const k = joinDataKey(key);
	if (action === "set") return [k, value];
	if (action === "sum") return [k, increment(value)];
	if (action === "with") return [k, arrayUnion(...value)];
	if (action === "omit") return [k, arrayRemove(...value)];
	return action; // Never happens.
}

/**
 * Firestore client database provider.
 * - Works with the Firebase JS SDK.
 * - Supports offline mode.
 * - Supports realtime subscriptions.
 */
export class FirestoreClientProvider<I extends string = string, T extends Data = Data> extends DBProvider<I, T> {
	private readonly _firestore: Firestore;
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

	async getItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const snapshot = await getDoc(this._doc(c, id));
		return _getOptionalItem<II, TT>(snapshot);
	}
	getItemSequence<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		return new LazyDeferredSequence(sequence =>
			onSnapshot(
				this._doc(c, id),
				snapshot => sequence.resolve(_getOptionalItem<II, TT>(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}
	async addItem<II extends I, TT extends T>(c: Collection<string, II, TT>, data: TT): Promise<II> {
		const reference = await addDoc(this._collection(c), data);
		return reference.id as II; // `as II` needed: Firestore returns string, not II.
	}
	async setItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await setDoc(this._doc(c, id), data);
	}
	async updateItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II, updates: Updates<Item<II, TT>>): Promise<void> {
		await updateDoc(this._doc(c, id), _getFieldValues(updates));
	}
	async deleteItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): Promise<void> {
		await deleteDoc(this._doc(c, id));
	}
	override async countQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<number> {
		const snapshot = await getCountFromServer(this._query(c, q));
		return snapshot.data().count;
	}
	async getQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		return _getItems<II, TT>(await getDocs(this._query(c, q)));
	}
	getQuerySequence<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): ItemsSequence<II, TT> {
		return new LazyDeferredSequence(sequence =>
			onSnapshot(
				this._query(c, q),
				snapshot => sequence.resolve(_getItems<II, TT>(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}
	async setQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>, data: TT): Promise<void> {
		const snapshot = await getDocs(this._query(c, q));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
	}
	async updateQuery<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		q: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		const snapshot = await getDocs(this._query(c, q));
		const fieldValues = _getFieldValues(updates);
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, fieldValues)));
	}
	async deleteQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>): Promise<void> {
		const snapshot = await getDocs(this._query(c, q));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
