import type {
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	Query as FirestoreQuery,
	QuerySnapshot as FirestoreQuerySnapshot,
	DocumentReference as FirestoreDocumentReference,
	CollectionReference as FirestoreCollectionReference,
} from "@google-cloud/firestore";
import { Firestore, FieldValue } from "@google-cloud/firestore";
import {
	Provider,
	DataDocument,
	DataQuery,
	FilterOperator,
	Observer,
	SortDirection,
	Result,
	dispatchNext,
	dispatchError,
	Transform,
	IncrementTransform,
	Data,
	AsynchronousProvider,
	DataTransform,
	AssertionError,
	Entry,
	Results,
	Unsubscriber,
	ArrayTransforms,
	UnsupportedError,
	ObjectTransforms,
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

/** Get a Firestore DocumentReference for a given documente. */
function getDocument<T extends Data>(firestore: Firestore, { collection, id }: DataDocument<T>): FirestoreDocumentReference<T> {
	return firestore.doc(`${collection}/${id}`) as FirestoreDocumentReference<T>;
}

/** Get a Firestore CollectionReference for a given document. */
function getCollection<T extends Data>(firestore: Firestore, { collection }: DataQuery<T>): FirestoreCollectionReference<T> {
	return firestore.collection(collection) as FirestoreCollectionReference<T>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<T extends Data>(firestore: Firestore, ref: DataQuery<T>): FirestoreQuery<T> {
	const { sorts, filters, limit } = ref;
	let query: FirestoreQuery<T> = getCollection(firestore, ref);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (typeof limit === "number") query = query.limit(limit);
	return query;
}

/** Create a set of results from a collection snapshot. */
function* getResults<T extends Data>(snapshot: FirestoreQuerySnapshot<T>): Iterable<Entry<T>> {
	for (const s of snapshot.docs) yield [s.id, s.data()];
}

/** Convert a `Transform` instances into corresponding Firestore `FieldValue` instances. */
function getFieldValues<T extends Data>(transform: Transform<T>): Data {
	if (transform instanceof DataTransform) return Object.fromEntries(yieldFieldValues(transform));
	throw new AssertionError("Unsupported transform", transform);
}
function* yieldFieldValues(transforms: Iterable<Entry>, prefix = ""): Iterable<Entry> {
	for (const [key, transform] of transforms) {
		if (!(transform instanceof Transform)) yield [`${prefix}${key}`, transform !== undefined ? transform : FieldValue.delete()];
		if (transform instanceof IncrementTransform) yield [`${prefix}${key}`, FieldValue.increment(transform.amount)];
		else if (transform instanceof DataTransform || transform instanceof ObjectTransforms) yield* yieldFieldValues(transform, `${prefix}${key}.`);
		else if (transform instanceof ArrayTransforms) {
			if (transform.adds.length && transform.deletes.length) throw new UnsupportedError("Cannot add/delete array items in one update");
			if (transform.adds.length) yield [`${prefix}${key}`, FieldValue.arrayUnion(...transform.adds)];
			else if (transform.deletes.length) yield [`${prefix}${key}`, FieldValue.arrayRemove(...transform.deletes)];
		} else throw new AssertionError("Unsupported transform", transform);
	}
}

/**
 * Firestore server database provider.
 * - Works with the Firebase Admin SDK for Node.JS
 */
export class FirestoreServerProvider extends Provider implements AsynchronousProvider {
	readonly firestore: Firestore;

	constructor(firestore = new Firestore()) {
		super();
		this.firestore = firestore;
	}

	async get<T extends Data>(ref: DataDocument<T>): Promise<Result<T>> {
		return (await getDocument(this.firestore, ref).get()).data();
	}

	subscribe<T extends Data>(ref: DataDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		return getDocument(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, snapshot.data()),
			thrown => dispatchError(observer, thrown),
		);
	}

	async add<T extends Data>(ref: DataQuery<T>, data: T): Promise<string> {
		return (await getCollection(this.firestore, ref).add(data)).id;
	}

	async write<T extends Data>(ref: DataDocument<T>, value: T | Transform<T> | undefined): Promise<void> {
		if (value instanceof Transform) await getDocument(this.firestore, ref).update(getFieldValues(value));
		else if (value) await getDocument(this.firestore, ref).set(value);
		else await getDocument(this.firestore, ref).delete();
	}

	async getQuery<T extends Data>(ref: DataQuery<T>): Promise<Iterable<Entry<T>>> {
		return getResults(await getQuery(this.firestore, ref).get());
	}

	subscribeQuery<T extends Data>(ref: DataQuery<T>, observer: Observer<Results<T>>): Unsubscriber {
		return getQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, getResults(snapshot)),
			thrown => dispatchError(observer, thrown),
		);
	}

	async writeQuery<T extends Data>(ref: DataQuery<T>, value: T | Transform<T> | undefined): Promise<void> {
		const writer = this.firestore.bulkWriter();
		const query = getQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
		const updates = value instanceof Transform ? getFieldValues(value) : undefined;
		let current: FirestoreQuery | false = query;
		while (current) {
			const snapshot: FirestoreQuerySnapshot = await current.get();
			if (updates) for (const s of snapshot.docs) void writer.update(s.ref, updates);
			else if (value) for (const s of snapshot.docs) void writer.set(s.ref, value);
			else for (const s of snapshot.docs) void writer.delete(s.ref);
			current = snapshot.size >= BATCH_SIZE && query.startAfter(snapshot.docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}
}

const BATCH_SIZE = 1000;
