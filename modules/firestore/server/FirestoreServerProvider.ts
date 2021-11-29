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
	DatabaseDocument,
	DatabaseQuery,
	FilterOperator,
	Observer,
	SortDirection,
	Result,
	dispatchNext,
	dispatchError,
	Transform,
	IncrementTransform,
	AddItemsTransform,
	RemoveItemsTransform,
	AddEntriesTransform,
	RemoveEntriesTransform,
	Data,
	AsynchronousProvider,
	DataTransform,
	AssertionError,
	Datas,
	Key,
	Entry,
	Results,
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
function getDocument<D extends Datas, C extends Key<D>>(firestore: Firestore, { collection, id }: DatabaseDocument<C, D>): FirestoreDocumentReference<D[C]> {
	return firestore.doc(`${collection}/${id}`) as FirestoreDocumentReference<D[C]>;
}

/** Get a Firestore CollectionReference for a given document. */
function getCollection<D extends Datas, C extends Key<D>>(firestore: Firestore, { collection }: DatabaseQuery<C, D>): FirestoreCollectionReference<D[C]> {
	return firestore.collection(collection) as FirestoreCollectionReference<D[C]>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<D extends Datas, C extends Key<D>>(firestore: Firestore, ref: DatabaseQuery<C, D>): FirestoreQuery<D[C]> {
	const { sorts, filters, limit } = ref;
	let query: FirestoreQuery<D[C]> = getCollection(firestore, ref);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (typeof limit === "number") query = query.limit(limit);
	return query;
}

/** Create a set of results from a collection snapshot. */
function* getResults<D extends Datas, C extends Key<D>>(snapshot: FirestoreQuerySnapshot<D[C]>): Iterable<Entry<D[C]>> {
	for (const s of snapshot.docs) yield [s.id, s.data()];
}

/** Convert a `Transform` instances into corresponding Firestore `FieldValue` instances. */
function getFieldValues<D extends Datas, C extends Key<D>>(transform: Transform<D[C]>): Data {
	if (transform instanceof DataTransform) return Object.fromEntries(yieldFieldValues(transform));
	throw new AssertionError("Unsupported transform", transform);
}
function* yieldFieldValues(transforms: DataTransform<Data>, prefix = ""): Iterable<Entry> {
	for (const [key, transform] of transforms) {
		if (!(transform instanceof Transform)) yield [`${prefix}${key}`, transform];
		if (transform instanceof IncrementTransform) yield [`${prefix}${key}`, FieldValue.increment(transform.amount)];
		else if (transform instanceof AddItemsTransform) yield [`${prefix}${key}`, FieldValue.arrayUnion(...transform)];
		else if (transform instanceof RemoveItemsTransform) yield [`${prefix}${key}`, FieldValue.arrayRemove(...transform)];
		else if (transform instanceof AddEntriesTransform) for (const [k, v] of transform) yield [`${prefix}${key}.${k}`, v];
		else if (transform instanceof RemoveEntriesTransform) for (const k of transform) yield [`${prefix}${key}.${k}`, FieldValue.delete()];
		else if (transform instanceof DataTransform) yield* yieldFieldValues(transform, `${prefix}${key}.`);
		else throw new AssertionError("Unsupported transform", transform);
	}
}

/**
 * Firestore server database provider.
 * - Works with the Firebase Admin SDK for Node.JS
 */
export class FirestoreServerProvider<D extends Datas> extends Provider<D> implements AsynchronousProvider<D> {
	readonly firestore: Firestore;

	constructor(firestore = new Firestore()) {
		super();
		this.firestore = firestore;
	}

	async get<C extends Key<D>>(ref: DatabaseDocument<C, D>): Promise<Result<D[C]>> {
		return (await getDocument(this.firestore, ref).get()).data();
	}

	subscribe<C extends Key<D>>(ref: DatabaseDocument<C, D>, observer: Observer<Result<D[C]>>): () => void {
		return getDocument(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(snapshot.data(), observer),
			thrown => dispatchError(thrown, observer),
		);
	}

	async add<C extends Key<D>>(ref: DatabaseQuery<C, D>, data: D[C]): Promise<string> {
		return (await getCollection(this.firestore, ref).add(data)).id;
	}

	async write<C extends Key<D>>(ref: DatabaseDocument<C, D>, value: D[C] | Transform<D[C]> | undefined): Promise<void> {
		if (value instanceof Transform) await getDocument(this.firestore, ref).update(getFieldValues(value));
		else if (value) await getDocument(this.firestore, ref).set(value);
		else await getDocument(this.firestore, ref).delete();
	}

	async getQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>): Promise<Iterable<Entry<D[C]>>> {
		return getResults(await getQuery(this.firestore, ref).get());
	}

	subscribeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, observer: Observer<Results<D[C]>>): () => void {
		return getQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(getResults(snapshot), observer),
			thrown => dispatchError(thrown, observer),
		);
	}

	async writeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, value: D[C] | Transform<D[C]> | undefined): Promise<void> {
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
