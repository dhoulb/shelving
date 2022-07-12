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
	UpdateData as FirestoreUpdateData,
} from "firebase/firestore";
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
	onSnapshot,
	addDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	getDoc,
	getDocs,
} from "firebase/firestore";
import type { DocumentReference, QueryReference } from "../../db/Reference.js";
import type { Data, Entity, Entities, OptionalEntity } from "../../util/data.js";
import type { Entry } from "../../util/entry.js";
import type { FilterOperator } from "../../query/Filter.js";
import type { SortDirection } from "../../query/Sort.js";
import type { Unsubscribe } from "../../observe/Observable.js";
import { dispatchError, dispatchNext, Observer } from "../../observe/Observer.js";
import { UnsupportedError } from "../../error/UnsupportedError.js";
import { AsynchronousProvider, Provider } from "../../provider/Provider.js";
import { ArrayUpdate } from "../../update/ArrayUpdate.js";
import { DataUpdate } from "../../update/DataUpdate.js";
import { Increment } from "../../update/Increment.js";
import { ObjectUpdate } from "../../update/ObjectUpdate.js";
import { Delete } from "../../update/Delete.js";
import { Update } from "../../update/Update.js";

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
function getDocument<T extends Data>(firestore: Firestore, { collection, id }: DocumentReference<T>): FirestoreDocumentReference<T> {
	return firestoreDocument(firestore, collection, id) as FirestoreDocumentReference<T>;
}

/** Get a Firestore CollectionReference for a given query. */
function getCollection<T extends Data>(firestore: Firestore, { collection }: QueryReference<T>): FirestoreCollectionReference<T> {
	return firestoreCollection(firestore, collection) as FirestoreCollectionReference<T>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<T extends Data>(firestore: Firestore, ref: QueryReference<T>): FirestoreQueryReference<T> {
	return firestoreQuery(getCollection(firestore, ref), ...yieldQueryConstraints(ref));
}
function* yieldQueryConstraints<T extends Data>({ sorts, filters, limit }: QueryReference<T>): Iterable<FirestoreQueryConstraint> {
	for (const { key, direction } of sorts) yield firestoreOrderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) yield firestoreWhere(key === "id" ? ID : key, OPERATORS[operator], value);
	if (typeof limit === "number") yield firestoreLimit(limit);
}

function getEntities<T extends Data>(snapshot: FirestoreQuerySnapshot<T>): Entities<T> {
	return snapshot.docs.map(getEntity);
}

function getEntity<T extends Data>(snapshot: FirestoreQueryDocumentSnapshot<T>): Entity<T> {
	const data = snapshot.data();
	return { ...data, id: snapshot.id };
}

function getOptionalEntity<T extends Data>(snapshot: FirestoreDocumentSnapshot<T>): OptionalEntity<T> {
	const data = snapshot.data();
	return data ? { ...data, id: snapshot.id } : null;
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function* yieldFieldValues(updates: Iterable<Entry>, prefix = ""): Iterable<Entry> {
	for (const [key, update] of updates) {
		if (!(update instanceof Update)) yield [`${prefix}${key}`, update];
		else if (update instanceof Delete) yield [`${prefix}${key}`, firestoreDeleteField()];
		else if (update instanceof Increment) yield [`${prefix}${key}`, firestoreIncrement(update.amount)];
		else if (update instanceof DataUpdate || update instanceof ObjectUpdate) yield* yieldFieldValues(update, `${prefix}${key}.`);
		else if (update instanceof ArrayUpdate) {
			if (update.adds.length && update.deletes.length) throw new UnsupportedError("Cannot add/delete array items in one update");
			if (update.adds.length) yield [`${prefix}${key}`, firestoreArrayUnion(...update.adds)];
			else if (update.deletes.length) yield [`${prefix}${key}`, firestoreArrayRemove(...update.deletes)];
		} else yield [`${prefix}${key}`, update.transform()];
	}
}

/**
 * Firestore client database provider.
 * - Works with the Firebase JS SDK.
 * - Supports offline mode.
 * - Supports realtime subscriptions.
 */
export class FirestoreClientProvider extends Provider implements AsynchronousProvider {
	readonly firestore: Firestore;

	constructor(firestore: Firestore) {
		super();
		this.firestore = firestore;
	}

	async getDocument<T extends Data>(ref: DocumentReference<T>): Promise<OptionalEntity<T>> {
		return getOptionalEntity(await getDoc(getDocument(this.firestore, ref)));
	}

	subscribeDocument<T extends Data>(ref: DocumentReference<T>, observer: Observer<OptionalEntity<T>>): Unsubscribe {
		return onSnapshot(
			getDocument(this.firestore, ref),
			snapshot => dispatchNext(observer, getOptionalEntity(snapshot)),
			thrown => dispatchError(observer, thrown),
		);
	}

	async addDocument<T extends Data>(ref: QueryReference<T>, data: T): Promise<string> {
		const reference = await addDoc(getCollection(this.firestore, ref), data);
		return reference.id;
	}

	async setDocument<T extends Data>(ref: DocumentReference<T>, data: T): Promise<void> {
		await setDoc(getDocument(this.firestore, ref), data);
	}

	async updateDocument<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): Promise<void> {
		const fieldValues = Object.fromEntries(yieldFieldValues(update)) as FirestoreUpdateData<T>;
		await updateDoc(getDocument(this.firestore, ref), fieldValues);
	}

	async deleteDocument<T extends Data>(ref: DocumentReference<T>): Promise<void> {
		await deleteDoc(getDocument(this.firestore, ref));
	}

	async getQuery<T extends Data>(ref: QueryReference<T>): Promise<Entities<T>> {
		return getEntities(await getDocs(getQuery(this.firestore, ref)));
	}

	subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: Observer<Entities<T>>): Unsubscribe {
		return onSnapshot(
			getQuery(this.firestore, ref),
			snapshot => dispatchNext(observer, getEntities(snapshot)),
			thrown => dispatchError(observer, thrown),
		);
	}

	async setQuery<T extends Data>(ref: QueryReference<T>, data: T): Promise<number> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
		return snapshot.size;
	}

	async updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): Promise<number> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		const fieldValues = Object.fromEntries(yieldFieldValues(update)) as FirestoreUpdateData<T>;
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, fieldValues)));
		return snapshot.size;
	}

	async deleteQuery<T extends Data>(ref: QueryReference<T>): Promise<number> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
		return snapshot.size;
	}
}
