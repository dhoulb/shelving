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
	DatabaseDocument,
	DatabaseQuery,
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
	Datas,
	Key,
	Entry,
	Data,
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
function getDocument<D extends Datas, C extends Key<D>>(firestore: Firestore, { collection, id }: DatabaseDocument<C, D>): FirestoreDocumentReference<D[C]> {
	return firestoreDocument(firestore, collection, id) as FirestoreDocumentReference<D[C]>;
}

/** Get a Firestore CollectionReference for a given query. */
function getCollection<D extends Datas, C extends Key<D>>(firestore: Firestore, { collection }: DatabaseQuery<C, D>): FirestoreCollectionReference<D[C]> {
	return firestoreCollection(firestore, collection) as FirestoreCollectionReference<D[C]>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<D extends Datas, C extends Key<D>>(firestore: Firestore, ref: DatabaseQuery<C, D>): FirestoreQueryReference<D[C]> {
	const { sorts, filters, limit } = ref;
	const constraints: FirestoreQueryConstraint[] = [];
	for (const { key, direction } of sorts) constraints.push(firestoreOrderBy(key === "id" ? ID : key, DIRECTIONS[direction]));
	for (const { operator, key, value } of filters) constraints.push(firestoreWhere(key === "id" ? ID : key, OPERATORS[operator], value));
	if (typeof limit === "number") constraints.push(firestoreLimit(limit));
	return firestoreQuery(getCollection(firestore, ref), ...constraints);
}

/** Create a set of results from a collection snapshot. */
function* getResults<D extends Datas, C extends Key<D>>(snapshot: FirestoreQuerySnapshot<D[C]>): Results<D[C]> {
	for (const s of snapshot.docs) yield [s.id, s.data()];
}

/** Convert `Transform` instances into corresponding Firestore `FieldValue` instances. */
function getFieldValues<D extends Datas, C extends Key<D>>(transform: Transform<D[C]>): Data {
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
export class FirestoreClientProvider<D extends Datas> extends Provider<D> implements AsynchronousProvider<D> {
	readonly firestore: Firestore;

	constructor(firestore: Firestore) {
		super();
		this.firestore = firestore;
	}

	async get<C extends Key<D>>(ref: DatabaseDocument<C, D>): Promise<Result<D[C]>> {
		const snapshot = await getDoc(getDocument(this.firestore, ref));
		return snapshot.data();
	}

	subscribe<C extends Key<D>>(ref: DatabaseDocument<C, D>, observer: Observer<Result<D[C]>>): () => void {
		return onSnapshot(
			getDocument(this.firestore, ref),
			snapshot => dispatchNext(snapshot.data(), observer),
			thrown => dispatchError(thrown, observer),
		);
	}

	async add<C extends Key<D>>(ref: DatabaseQuery<C, D>, data: D[C]): Promise<string> {
		const reference = await addDoc<any>(getCollection(this.firestore, ref), data); // eslint-disable-line @typescript-eslint/no-explicit-any
		return reference.id;
	}

	async write<C extends Key<D>>(ref: DatabaseDocument<C, D>, value: D[C] | Transform<D[C]> | undefined): Promise<void> {
		if (value instanceof Transform) await updateDoc<unknown>(getDocument(this.firestore, ref), getFieldValues(value));
		else if (value) await setDoc<unknown>(getDocument(this.firestore, ref), value);
		else await deleteDoc(getDocument(this.firestore, ref));
	}

	async getQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>): Promise<Results<D[C]>> {
		return getResults(await getDocs(getQuery(this.firestore, ref)));
	}

	subscribeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, observer: Observer<Results<D[C]>>): () => void {
		return onSnapshot(
			getQuery(this.firestore, ref),
			snapshot => dispatchNext(getResults(snapshot), observer),
			thrown => dispatchError(thrown, observer),
		);
	}

	async writeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, value: D[C] | Transform<D[C]> | undefined): Promise<void> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		const updates = value instanceof Transform && getFieldValues(value);
		if (updates) await Promise.all(snapshot.docs.map(s => updateDoc<unknown>(s.ref, updates)));
		else if (value) await Promise.all(snapshot.docs.map(s => setDoc<unknown>(s.ref, value)));
		else await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
