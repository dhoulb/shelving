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
	Data,
	Results,
	Provider,
	ModelDocument,
	ModelQuery,
	FilterOperator,
	Observer,
	SortDirection,
	Mutable,
	Result,
	dispatchNext,
	dispatchError,
	MutableObject,
	Transformer,
	IncrementTransform,
	AddItemsTransform,
	RemoveItemsTransform,
	AddEntriesTransform,
	RemoveEntriesTransform,
	ImmutableObject,
	AsynchronousProvider,
	ObjectTransform,
	isTransformer,
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
function getDocument<X extends Data>(firestore: Firestore, { collection, id }: ModelDocument<X>): FirestoreDocumentReference<X> {
	return firestore.doc(`${collection}/${id}`) as FirestoreDocumentReference<X>;
}

/** Get a Firestore CollectionReference for a given Shelving `Document` instance. */
function getCollection<X extends Data>(firestore: Firestore, { collection }: ModelQuery<X>): FirestoreCollectionReference<X> {
	return firestore.collection(collection) as FirestoreCollectionReference<X>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<X extends Data>(firestore: Firestore, ref: ModelQuery<X>): FirestoreQuery<X> {
	const { sorts, filters, slice } = ref;
	let query: FirestoreQuery<X> = getCollection(firestore, ref);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (slice.limit !== null) query = query.limit(slice.limit);
	return query;
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
	if (transformer instanceof IncrementTransform) output[key] = FieldValue.increment(transformer.amount);
	else if (transformer instanceof AddItemsTransform) output[key] = FieldValue.arrayUnion(...transformer);
	else if (transformer instanceof RemoveItemsTransform) output[key] = FieldValue.arrayRemove(...transformer);
	else if (transformer instanceof AddEntriesTransform) for (const [k, v] of transformer) output[`${key}.${k}`] = v;
	else if (transformer instanceof RemoveEntriesTransform) for (const k of transformer) output[`${key}.${k}`] = FieldValue.delete();
	else if (transformer instanceof ObjectTransform)
		for (const [k, v] of transformer) {
			if (isTransformer(v)) addFieldValues(output, `${key}.${k}`, v);
			else output[`${key}.${k}`] = v;
		}
	throw new AssertionError("Unsupported transformer", transformer);
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

	async get<X extends Data>(ref: ModelDocument<X>): Promise<Result<X>> {
		const snapshot = await getDocument(this.firestore, ref).get();
		return snapshot.data();
	}

	subscribe<X extends Data>(ref: ModelDocument<X>, observer: Observer<Result<X>>): () => void {
		return getDocument(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, snapshot.data()),
			error => dispatchError(observer, error),
		);
	}

	async add<X extends Data>(ref: ModelQuery<X>, data: X): Promise<string> {
		return (await getCollection(this.firestore, ref).add(data)).id;
	}

	async write<X extends Data>(ref: ModelDocument<X>, value: X | Transformer<X> | undefined): Promise<void> {
		if (isTransformer(value)) await getDocument(this.firestore, ref).update(createFieldValues(value));
		else if (value) await getDocument(this.firestore, ref).set(value);
		else await getDocument(this.firestore, ref).delete();
	}

	async getQuery<X extends Data>(ref: ModelQuery<X>): Promise<Results<X>> {
		const snapshot = await getQuery(this.firestore, ref).get();
		return getResults(snapshot);
	}

	subscribeQuery<X extends Data>(ref: ModelQuery<X>, observer: Observer<Results<X>>): () => void {
		return getQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, getResults(snapshot)),
			error => dispatchError(observer, error),
		);
	}

	async writeQuery<X extends Data>(ref: ModelQuery<X>, value: X | Transformer<X> | undefined): Promise<void> {
		const writer = this.firestore.bulkWriter();
		const query = getQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
		const updates = isTransformer(value) ? createFieldValues(value) : undefined;
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
