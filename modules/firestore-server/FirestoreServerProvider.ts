import "firebase-admin";
import type {
	Firestore,
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	Query as FirestoreQuery,
	QuerySnapshot as FirestoreQuerySnapshot,
	DocumentReference as FirestoreDocumentReference,
	CollectionReference as FirestoreCollectionReference,
} from "@google-cloud/firestore";
import {
	DocumentRequiredError,
	isObject,
	Data,
	Results,
	Provider,
	Document,
	Documents,
	Operator,
	Observer,
	Direction,
	Mutable,
	Result,
	dispatchNext,
	dispatchError,
} from "..";

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
function getDocument<X extends Data>(firestore: Firestore, { path }: Document<X>): FirestoreDocumentReference<X> {
	return firestore.doc(path) as FirestoreDocumentReference<X>;
}

/** Get a Firestore CollectionReference for a given Shelving `Document` instance. */
function getCollection<X extends Data>(firestore: Firestore, { path }: Documents<X>): FirestoreCollectionReference<X> {
	return firestore.collection(path) as FirestoreCollectionReference<X>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<X extends Data>(firestore: Firestore, ref: Documents<X>): FirestoreQuery<X> {
	const { sorts, filters, slice } = ref.query;
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

/**
 * Firestore server database provider.
 * - Works with the Node.JS admin SDK.
 * - Equality hash is set on returned values so `deepEqual()` etc can use it to quickly compare results without needing to look deeply.
 */
export class FirestoreServerProvider implements Provider {
	readonly firestore: Firestore;

	constructor(firestore: Firestore) {
		this.firestore = firestore;
	}

	async getDocument<X extends Data>(ref: Document<X>): Promise<Result<X>> {
		const snapshot = await getDocument(this.firestore, ref).get();
		return snapshot.data();
	}

	onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result<X>>): () => void {
		return getDocument(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, snapshot.data()),
			error => dispatchError(observer, error),
		);
	}

	async addDocument<X extends Data>(ref: Documents<X>, data: X): Promise<string> {
		return (await getCollection(this.firestore, ref).add(data)).id;
	}

	async setDocument<X extends Data>(ref: Document<X>, data: X): Promise<void> {
		await getDocument(this.firestore, ref).set(data);
	}

	async updateDocument<X extends Data>(ref: Document<X>, data: Partial<Data>): Promise<void> {
		try {
			await getDocument(this.firestore, ref).update(data);
		} catch (thrown: unknown) {
			if (isObject(thrown) && thrown.code === "not-found") throw new DocumentRequiredError(ref);
			throw thrown;
		}
	}

	async deleteDocument<X extends Data>(ref: Document<X>): Promise<void> {
		await getDocument(this.firestore, ref).delete();
		return undefined;
	}

	async getDocuments<X extends Data>(ref: Documents<X>): Promise<Results<X>> {
		const snapshot = await getQuery(this.firestore, ref).get();
		return getResults(snapshot);
	}

	onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): () => void {
		return getQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, getResults(snapshot)),
			error => dispatchError(observer, error),
		);
	}

	async setDocuments<X extends Data>(ref: Documents<X>, data: X): Promise<void> {
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

	async updateDocuments<X extends Data>(ref: Documents<X>, data: Partial<X>): Promise<void> {
		const writer = this.firestore.bulkWriter();
		const query = getQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: typeof query | false = query;
		while (current) {
			const snapshot = await query.get();
			for (const s of snapshot.docs) void writer.update(s.ref, data);
			current = snapshot.size >= BATCH_SIZE && query.startAfter(snapshot.docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}

	async deleteDocuments<X extends Data>(ref: Documents<X>): Promise<void> {
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
