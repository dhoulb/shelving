import type {
	Firestore,
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	Query as FirestoreQuery,
	QuerySnapshot as FirestoreQuerySnapshot,
	DocumentReference as FirestoreDocumentReference,
	CollectionReference as FirestoreCollectionReference,
} from "@google-cloud/firestore";
import { FieldValue } from "@google-cloud/firestore";
import {
	Data,
	Results,
	Provider,
	ModelDocument,
	ModelQuery,
	Operator,
	Observer,
	Direction,
	Mutable,
	Result,
	dispatchNext,
	dispatchError,
	MutableObject,
	Transforms,
	IncrementTransform,
	AddItemsTransform,
	RemoveItemsTransform,
	AddEntriesTransform,
	RemoveEntriesTransform,
	ImmutableObject,
	AsynchronousProvider,
	Transform,
} from "../../index.js";

// Constants.
// const ID = "__name__"; // DH: `__name__` is the entire path of the document. `__id__` is just ID.
const ID = "__id__"; // Internal way Firestore Queries can reference the ID of the current document.

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS: { readonly [K in Operator]: FirestoreWhereFilterOp } = {
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
const DIRECTIONS: { readonly [K in Direction]: FirestoreOrderByDirection } = {
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

/** Convert a set of Shelving `Transform` instances into the corresponding Firestore `FieldValue` instances. */
function convertTransforms<X extends Data>(transforms: Transforms<X>): ImmutableObject {
	const output: MutableObject = {};
	for (const [key, transform] of Object.entries(transforms)) {
		if (transform instanceof Transform) {
			if (transform instanceof IncrementTransform) {
				output[key] = FieldValue.increment(transform.amount);
			} else if (transform instanceof AddItemsTransform) {
				output[key] = FieldValue.arrayUnion(...transform.items);
			} else if (transform instanceof RemoveItemsTransform) {
				output[key] = FieldValue.arrayRemove(...transform.items);
			} else if (transform instanceof AddEntriesTransform) {
				for (const [k, v] of Object.entries(transform.props)) output[`${key}.${k}`] = v;
			} else if (transform instanceof RemoveEntriesTransform) {
				for (const k of transform.props) output[`${key}.${k}`] = FieldValue.delete();
			} else throw Error("Unsupported transform");
		} else if (transform !== undefined) {
			output[key] = transform;
		}
	}
	return output;
}

/**
 * Firestore server database provider.
 * - Works with the Firebase Admin SDK for Node.JS
 */
export class FirestoreServerProvider implements Provider, AsynchronousProvider {
	readonly firestore: Firestore;

	constructor(firestore: Firestore) {
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

	async set<X extends Data>(ref: ModelDocument<X>, data: X): Promise<void> {
		await getDocument(this.firestore, ref).set(data);
	}

	async update<X extends Data>(ref: ModelDocument<X>, transforms: Transforms<X>): Promise<void> {
		await getDocument(this.firestore, ref).update(convertTransforms(transforms));
	}

	async delete<X extends Data>(ref: ModelDocument<X>): Promise<void> {
		await getDocument(this.firestore, ref).delete();
		return undefined;
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

	async setQuery<X extends Data>(ref: ModelQuery<X>, data: X): Promise<void> {
		const writer = this.firestore.bulkWriter();
		const query = getQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: typeof query | false = query;
		while (current) {
			const snapshot = await query.get();
			for (const s of snapshot.docs) void writer.set(s.ref, data);
			current = snapshot.size >= BATCH_SIZE && query.startAfter(snapshot.docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}

	async updateQuery<X extends Data>(ref: ModelQuery<X>, transforms: Transforms<X>): Promise<void> {
		const updates = convertTransforms(transforms);
		const writer = this.firestore.bulkWriter();
		const query = getQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: typeof query | false = query;
		while (current) {
			const snapshot = await query.get();
			for (const s of snapshot.docs) void writer.update(s.ref, updates);
			current = snapshot.size >= BATCH_SIZE && query.startAfter(snapshot.docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}

	async deleteQuery<X extends Data>(ref: ModelQuery<X>): Promise<void> {
		const writer = this.firestore.bulkWriter();
		const query = getQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: typeof query | false = query;
		while (current) {
			const snapshot = await query.get();
			for (const s of snapshot.docs) void writer.delete(s.ref);
			current = snapshot.size >= BATCH_SIZE && query.startAfter(snapshot.docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}
}

const BATCH_SIZE = 1000;
