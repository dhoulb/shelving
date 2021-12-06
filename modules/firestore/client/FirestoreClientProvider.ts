import type {
	Firestore,
	DocumentReference as FirestoreDocumentReference,
	CollectionReference as FirestoreCollectionReference,
	Query as FirestoreQueryReference,
	QuerySnapshot as FirestoreQuerySnapshot,
	QueryConstraint as FirestoreQueryConstraint,
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
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
import {
	Results,
	Provider,
	DataDocument,
	DataQuery,
	FilterOperator,
	SortDirection,
	Result,
	Observer,
	dispatchNext,
	dispatchError,
	Transform,
	AddItemsTransform,
	AddEntriesTransform,
	IncrementTransform,
	RemoveItemsTransform,
	RemoveEntriesTransform,
	AsynchronousProvider,
	DataTransform,
	AssertionError,
	Entry,
	Data,
	Unsubscriber,
} from "../../index.js";

// Constants.
// const ID = "__name__"; // DH: `__name__` is the entire path of the document. `__id__` is just ID.
const ID = "__id__"; // Internal way Firestore Queries can reference the ID of the current document.

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS: { readonly [K in FilterOperator]: FirestoreWhereFilterOp } = {
	IS: "==",
	NOT: "!=",
	IN: "in",
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
function getDocument<T extends Data>(firestore: Firestore, { collection, id }: DataDocument<T>): FirestoreDocumentReference<T> {
	return firestoreDocument(firestore, collection, id) as FirestoreDocumentReference<T>;
}

/** Get a Firestore CollectionReference for a given query. */
function getCollection<T extends Data>(firestore: Firestore, { collection }: DataQuery<T>): FirestoreCollectionReference<T> {
	return firestoreCollection(firestore, collection) as FirestoreCollectionReference<T>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<T extends Data>(firestore: Firestore, ref: DataQuery<T>): FirestoreQueryReference<T> {
	const { sorts, filters, limit } = ref;
	const constraints: FirestoreQueryConstraint[] = [];
	for (const { key, direction } of sorts) constraints.push(firestoreOrderBy(key === "id" ? ID : key, DIRECTIONS[direction]));
	for (const { operator, key, value } of filters) constraints.push(firestoreWhere(key === "id" ? ID : key, OPERATORS[operator], value));
	if (typeof limit === "number") constraints.push(firestoreLimit(limit));
	return firestoreQuery(getCollection(firestore, ref), ...constraints);
}

/** Create a set of results from a collection snapshot. */
function* getResults<T extends Data>(snapshot: FirestoreQuerySnapshot<T>): Results<T> {
	for (const s of snapshot.docs) yield [s.id, s.data()];
}

/** Convert `Transform` instances into corresponding Firestore `FieldValue` instances. */
function getFieldValues<T extends Data>(transform: Transform<T>): Data {
	if (transform instanceof DataTransform) return Object.fromEntries(yieldFieldValues(transform));
	throw new AssertionError("Unsupported transform", transform);
}
function* yieldFieldValues(transforms: DataTransform<Data>, prefix = ""): Generator<Entry, void> {
	for (const [key, transform] of transforms) {
		if (!(transform instanceof Transform)) yield [`${prefix}${key}`, transform];
		if (transform instanceof IncrementTransform) yield [`${prefix}${key}`, firestoreIncrement(transform.amount)];
		else if (transform instanceof AddItemsTransform) yield [`${prefix}${key}`, firestoreArrayUnion(...transform)];
		else if (transform instanceof RemoveItemsTransform) yield [`${prefix}${key}`, firestoreArrayRemove(...transform)];
		else if (transform instanceof AddEntriesTransform) for (const [k, v] of transform) yield [`${prefix}${key}.${k}`, v];
		else if (transform instanceof RemoveEntriesTransform) for (const k of transform) yield [`${prefix}${key}.${k}`, firestoreDeleteField()];
		else if (transform instanceof DataTransform) yield* yieldFieldValues(transform, `${prefix}${key}.`);
		else throw new AssertionError("Unsupported transform", transform);
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

	async get<T extends Data>(ref: DataDocument<T>): Promise<Result<T>> {
		const snapshot = await getDoc(getDocument(this.firestore, ref));
		return snapshot.data();
	}

	subscribe<T extends Data>(ref: DataDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		return onSnapshot(
			getDocument(this.firestore, ref),
			snapshot => dispatchNext(observer, snapshot.data()),
			thrown => dispatchError(observer, thrown),
		);
	}

	async add<T extends Data>(ref: DataQuery<T>, data: T): Promise<string> {
		const reference = await addDoc<any>(getCollection(this.firestore, ref), data); // eslint-disable-line @typescript-eslint/no-explicit-any
		return reference.id;
	}

	async write<T extends Data>(ref: DataDocument<T>, value: T | Transform<T> | undefined): Promise<void> {
		if (value instanceof Transform) await updateDoc<unknown>(getDocument(this.firestore, ref), getFieldValues(value));
		else if (value) await setDoc<unknown>(getDocument(this.firestore, ref), value);
		else await deleteDoc(getDocument(this.firestore, ref));
	}

	async getQuery<T extends Data>(ref: DataQuery<T>): Promise<Results<T>> {
		return getResults(await getDocs(getQuery(this.firestore, ref)));
	}

	subscribeQuery<T extends Data>(ref: DataQuery<T>, observer: Observer<Results<T>>): Unsubscriber {
		return onSnapshot(
			getQuery(this.firestore, ref),
			snapshot => dispatchNext(observer, getResults(snapshot)),
			thrown => dispatchError(observer, thrown),
		);
	}

	async writeQuery<T extends Data>(ref: DataQuery<T>, value: T | Transform<T> | undefined): Promise<void> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		const updates = value instanceof Transform && getFieldValues(value);
		if (updates) await Promise.all(snapshot.docs.map(s => updateDoc<unknown>(s.ref, updates)));
		else if (value) await Promise.all(snapshot.docs.map(s => setDoc<unknown>(s.ref, value)));
		else await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
