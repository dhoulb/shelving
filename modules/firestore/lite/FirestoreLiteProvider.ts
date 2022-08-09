import type {
	Firestore,
	DocumentReference as FirestoreDocumentReference,
	DocumentSnapshot as FirestoreDocumentSnapshot,
	CollectionReference as FirestoreCollectionReference,
	Query as FirestoreQueryReference,
	QuerySnapshot as FirestoreQuerySnapshot,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	QueryConstraint as FirestoreQueryConstraint,
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	FieldValue as FirestoreFieldValue,
} from "firebase/firestore/lite";
import {
	orderBy as firestoreOrderBy,
	where as firestoreWhere,
	limit as firestoreLimit,
	increment as firestoreIncrement,
	arrayUnion as firestoreArrayUnion,
	arrayRemove as firestoreArrayRemove,
	deleteField as firestoreDeleteField,
	collection as firestoreCollection,
	doc as firestoreDocument,
	query as firestoreQuery,
	setDoc,
	addDoc,
	updateDoc,
	deleteDoc,
	getDoc,
	getDocs,
} from "firebase/firestore/lite";
import type { Data, Entity, Entities, OptionalEntity, Datas, Key } from "../../util/data.js";
import type { Entry } from "../../util/entry.js";
import type { FilterOperator } from "../../query/Filter.js";
import type { SortDirection } from "../../query/Sort.js";
import type { Unsubscribe } from "../../observe/Observable.js";
import type { AsyncProvider, ProviderCollection, ProviderDocument, ProviderQuery } from "../../provider/Provider.js";
import { UnsupportedError } from "../../error/UnsupportedError.js";
import { ArrayUpdate } from "../../update/ArrayUpdate.js";
import { DataUpdate } from "../../update/DataUpdate.js";
import { Increment } from "../../update/Increment.js";
import { ObjectUpdate } from "../../update/ObjectUpdate.js";
import { Update } from "../../update/Update.js";
import { Delete } from "../../update/Delete.js";

// Constants.
// const ID = "__name__"; // DH: `__name__` is the entire path of the document. `__id__` is just ID.
const ID = "__id__"; // Internal way Firestore Queries can reference the ID of the current document.

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS: { readonly [K in FilterOperator]: FirestoreWhereFilterOp } = {
	IS: "==",
	NOT: "!=",
	IN: "in",
	OUT: "not-in",
	GT: ">",
	GTE: ">=",
	LT: "<",
	LTE: "<=",
	CONTAINS: "array-contains",
};

// Map `Filter.types` to `OrderByDirection`
const DIRECTIONS: { readonly [K in SortDirection]: FirestoreOrderByDirection } = {
	ASC: "asc",
	DESC: "desc",
};

/** Get a Firestore DocumentReference for a given document. */
function _getDocument<T extends Datas, K extends Key<T>>(firestore: Firestore, { collection, id }: ProviderDocument<T, K>): FirestoreDocumentReference<T[K]> {
	return firestoreDocument(firestore, collection, id) as FirestoreDocumentReference<T[K]>;
}

/** Get a Firestore CollectionReference for a given query. */
function _getCollection<T extends Datas, K extends Key<T>>(firestore: Firestore, { collection }: ProviderCollection<T, K>): FirestoreCollectionReference<T[K]> {
	return firestoreCollection(firestore, collection) as FirestoreCollectionReference<T[K]>;
}

/** Create a corresponding `QueryReference` from a Query. */
function _getQuery<T extends Datas, K extends Key<T>>(firestore: Firestore, ref: ProviderQuery<T, K>): FirestoreQueryReference<T[K]> {
	return firestoreQuery(_getCollection(firestore, ref), ..._yieldQueryConstraints(ref));
}
function* _yieldQueryConstraints<T extends Datas, K extends Key<T>>({ sorts, filters, limit }: ProviderQuery<T, K>): Iterable<FirestoreQueryConstraint> {
	for (const { key, direction } of sorts) yield firestoreOrderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) yield firestoreWhere(key === "id" ? ID : key, OPERATORS[operator], value);
	if (typeof limit === "number") yield firestoreLimit(limit);
}

function _getEntities<T extends Data>(snapshot: FirestoreQuerySnapshot<T>): Entities<T> {
	return snapshot.docs.map(_getEntity);
}

function _getEntity<T extends Data>(snapshot: FirestoreQueryDocumentSnapshot<T>): Entity<T> {
	const data = snapshot.data();
	return { ...data, id: snapshot.id };
}

function _getOptionalData<T extends Data>(snapshot: FirestoreDocumentSnapshot<T>): OptionalEntity<T> {
	const data = snapshot.data();
	return data ? { ...data, id: snapshot.id } : null;
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function* _getFieldValues<T>(updates: Iterable<Entry<string, T | Update<T>>>, prefix = ""): Iterable<string | T | FirestoreFieldValue> {
	for (const [key, update] of updates) {
		if (update instanceof DataUpdate || update instanceof ObjectUpdate) {
			yield* _getFieldValues(update, `${prefix}${key}.`);
		} else if (update instanceof ArrayUpdate) {
			if (update.adds.length) {
				yield `${prefix}${key}`;
				yield firestoreArrayUnion(...update.adds);
			}
			if (update.deletes.length) {
				yield `${prefix}${key}`;
				yield firestoreArrayRemove(...update.deletes);
			}
		} else {
			yield `${prefix}${key}`;
			if (!(update instanceof Update)) yield update;
			else if (update instanceof Delete) yield firestoreDeleteField();
			else if (update instanceof Increment) yield firestoreIncrement(update.amount);
			else yield update.transform();
		}
	}
}

/**
 * Firestore Lite client database provider.
 * - Works with the Firebase JS SDK.
 * - Does not support offline mode.
 * - Does not support realtime subscriptions.
 */
export class FirestoreLiteProvider<T extends Datas> implements AsyncProvider<T> {
	readonly firestore: Firestore;
	constructor(firestore: Firestore) {
		this.firestore = firestore;
	}
	async getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<OptionalEntity<T[K]>> {
		return _getOptionalData(await getDoc(_getDocument(this.firestore, ref)));
	}
	subscribeDocument(): Unsubscribe {
		throw new UnsupportedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	async addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): Promise<string> {
		const reference = await addDoc(_getCollection(this.firestore, ref), data);
		return reference.id;
	}
	async setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): Promise<void> {
		await setDoc(_getDocument(this.firestore, ref), data);
	}
	async updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): Promise<void> {
		await updateDoc(_getDocument(this.firestore, ref), ...(_getFieldValues(update) as [string, unknown, ...unknown[]]));
	}
	async deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<void> {
		await deleteDoc(_getDocument(this.firestore, ref));
	}
	async getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<Entities<T[K]>> {
		return _getEntities(await getDocs(_getQuery(this.firestore, ref)));
	}
	subscribeQuery(): Unsubscribe {
		throw new UnsupportedError("FirestoreLiteProvider does not support realtime subscriptions");
	}
	async setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): Promise<number> {
		const snapshot = await getDocs(_getQuery(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
		return snapshot.size;
	}
	async updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): Promise<number> {
		const snapshot = await getDocs(_getQuery(this.firestore, ref));
		const fieldValues = Array.from(_getFieldValues(update)) as [string, unknown, ...unknown[]];
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, ...fieldValues)));
		return snapshot.size;
	}
	async deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<number> {
		const snapshot = await getDocs(_getQuery(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
		return snapshot.size;
	}
}
