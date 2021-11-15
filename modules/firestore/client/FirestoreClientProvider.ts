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
	getDoc,
	orderBy,
	where,
	limit,
	addDoc,
	increment,
	arrayUnion,
	arrayRemove,
	deleteField,
	collection as getFirestoreCollection,
	doc as getFirestoreDoc,
	query as getFirestoreQuery,
	onSnapshot,
	setDoc,
	updateDoc,
	deleteDoc,
	getDocs,
} from "firebase/firestore";
import {
	Data,
	Results,
	Provider,
	ModelDocument,
	ModelQuery,
	FilterOperator,
	SortDirection,
	Mutable,
	Result,
	Observer,
	dispatchNext,
	dispatchError,
	Transformer,
	isTransformer,
	AddItemsTransform,
	AddEntriesTransform,
	IncrementTransform,
	MutableObject,
	RemoveItemsTransform,
	RemoveEntriesTransform,
	ImmutableObject,
	AsynchronousProvider,
	ObjectTransform,
	AssertionError,
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

/** Get a Firestore DocumentReference for a given Shelving `Document` instance. */
function getDocumentReference<X extends Data>(firestore: Firestore, { collection, id }: ModelDocument<X>): FirestoreDocumentReference<X> {
	return getFirestoreDoc(firestore, collection, id) as FirestoreDocumentReference<X>;
}

/** Get a Firestore CollectionReference for a given Shelving `Document` instance. */
function getCollectionReference<X extends Data>(firestore: Firestore, { collection }: ModelQuery<X>): FirestoreCollectionReference<X> {
	return getFirestoreCollection(firestore, collection) as FirestoreCollectionReference<X>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQueryReference<X extends Data>(firestore: Firestore, ref: ModelQuery<X>): FirestoreQueryReference<X> {
	const { sorts, filters, slice } = ref;
	const constraints: FirestoreQueryConstraint[] = [];
	for (const { key, direction } of sorts) constraints.push(orderBy(key === "id" ? ID : key, DIRECTIONS[direction]));
	for (const { operator, key, value } of filters) constraints.push(where(key === "id" ? ID : key, OPERATORS[operator], value));
	if (slice.limit !== null) constraints.push(limit(slice.limit));
	return getFirestoreQuery(getCollectionReference(firestore, ref), ...constraints);
}

/** Create a set of results from a collection snapshot. */
function getResults<X extends Data>(snapshot: FirestoreQuerySnapshot<X>): Results<X> {
	const results: Mutable<Results<X>> = {};
	for (const s of snapshot.docs) results[s.id] = s.data();
	return results;
}

/** Convert a `Transformer` instances into corresponding Firestore `FieldValue` instances. */
function createFieldValues<X extends Data>(transformer: Transformer<X>): ImmutableObject {
	if (transformer instanceof ObjectTransform) {
		const output: MutableObject = {};
		for (const [k, v] of transformer) {
			if (isTransformer(v)) addFieldValues(output, k, v);
			else output[k] = v;
		}
		return output;
	}
	throw new AssertionError("Unsupported transformer", transformer);
}
function addFieldValues<X>(output: MutableObject, key: string, transformer: Transformer<X>): void {
	if (transformer instanceof ObjectTransform)
		for (const [k, v] of transformer) {
			if (isTransformer(v)) addFieldValues(output, `${key}.${k}`, v);
			else output[`${key}.${k}`] = v;
		}
	else if (transformer instanceof IncrementTransform) output[key] = increment(transformer.amount);
	else if (transformer instanceof AddItemsTransform) output[key] = arrayUnion(...transformer);
	else if (transformer instanceof RemoveItemsTransform) output[key] = arrayRemove(...transformer);
	else if (transformer instanceof AddEntriesTransform) for (const [k, v] of transformer) output[`${key}.${k}`] = v;
	else if (transformer instanceof RemoveEntriesTransform) for (const k of transformer) output[`${key}.${k}`] = deleteField();
	throw new AssertionError("Unsupported transformer", transformer);
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

	async get<X extends Data>(ref: ModelDocument<X>): Promise<Result<X>> {
		const snapshot = await getDoc(getDocumentReference(this.firestore, ref));
		return snapshot.data();
	}

	subscribe<X extends Data>(ref: ModelDocument<X>, observer: Observer<Result<X>>): () => void {
		return onSnapshot(
			getDocumentReference(this.firestore, ref),
			snapshot => dispatchNext(observer, snapshot.data()),
			error => dispatchError(observer, error),
		);
	}

	async add<X extends Data>(ref: ModelQuery<X>, data: X): Promise<string> {
		const reference = await addDoc<any>(getCollectionReference(this.firestore, ref), data); // eslint-disable-line @typescript-eslint/no-explicit-any
		return reference.id;
	}

	async write<X extends Data>(ref: ModelDocument<X>, value: X | Transformer<X> | undefined): Promise<void> {
		if (isTransformer(value)) await updateDoc<unknown>(getDocumentReference(this.firestore, ref), createFieldValues(value));
		else if (value) await setDoc<unknown>(getDocumentReference(this.firestore, ref), value);
		else await deleteDoc(getDocumentReference(this.firestore, ref));
	}

	async getQuery<X extends Data>(ref: ModelQuery<X>): Promise<Results<X>> {
		return getResults(await getDocs(getQueryReference(this.firestore, ref)));
	}

	subscribeQuery<X extends Data>(ref: ModelQuery<X>, observer: Observer<Results<X>>): () => void {
		return onSnapshot(
			getQueryReference(this.firestore, ref),
			snapshot => dispatchNext(observer, getResults(snapshot)),
			error => dispatchError(observer, error),
		);
	}

	async writeQuery<X extends Data>(ref: ModelQuery<X>, value: X | Transformer<X> | undefined): Promise<void> {
		const snapshot = await getDocs(getQueryReference(this.firestore, ref));
		const updates = isTransformer(value) && createFieldValues(value);
		if (updates) await Promise.all(snapshot.docs.map(s => updateDoc<unknown>(s.ref, updates)));
		else if (value) await Promise.all(snapshot.docs.map(s => setDoc<unknown>(s.ref, value)));
		else await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
