import "firebase-admin";
import type {
	Firestore,
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	Query as FirestoreQuery,
	QuerySnapshot as FirestoreQuerySnapshot,
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

/** Create a corresponding `QueryReference` from a Query. */
const buildQuery = (firestore: Firestore, { path, query: { filters, sorts, slice } }: Documents): FirestoreQuery => {
	let query: FirestoreQuery = firestore.collection(path);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (slice.limit !== null) query = query.limit(slice.limit);
	return query as FirestoreQuery;
};

/** Create a set of results from a collection snapshot. */
const snapshotResults = (snapshot: FirestoreQuerySnapshot): Results => {
	const results: Mutable<Results> = {};
	for (const s of snapshot.docs) results[s.id] = s.data();
	return results;
};

/**
 * Firestore server database provider.
 * - Works with the Node.JS admin SDK.
 * - Equality hash is set on returned values so `deepEqual()` etc can use it to quickly compare results without needing to look deeply.
 */
export class FirestoreServerProvider implements Provider {
	readonly firestore: Firestore;

	constructor({ firestore }: { firestore: Firestore }) {
		this.firestore = firestore;
	}

	async getDocument(ref: Document): Promise<Result> {
		const doc = this.firestore.doc(ref.path);
		const snapshot = await doc.get();
		return snapshot.data();
	}

	onDocument(ref: Document, observer: Observer<Result>): () => void {
		return this.firestore.doc(ref.path).onSnapshot(
			snapshot => dispatchNext(observer, snapshot.data()),
			error => dispatchError(observer, error),
		);
	}

	async addDocument(ref: Documents, data: Data): Promise<string> {
		const { id } = await this.firestore.collection(ref.path).add(data);
		return id;
	}

	async setDocument(ref: Document, data: Data): Promise<void> {
		await this.firestore.doc(ref.path).set(data);
	}

	async updateDocument(ref: Document, data: Partial<Data>): Promise<void> {
		try {
			await this.firestore.doc(ref.path).update(data);
		} catch (thrown: unknown) {
			if (isObject(thrown) && thrown.code === "not-found") throw new DocumentRequiredError(ref);
			throw thrown;
		}
	}

	async deleteDocument(ref: Document): Promise<void> {
		await this.firestore.doc(ref.path).delete();
		return undefined;
	}

	async getDocuments(ref: Documents): Promise<Results> {
		const snapshot = await buildQuery(this.firestore, ref).get();
		return snapshotResults(snapshot);
	}

	onDocuments(ref: Documents, observer: Observer<Results>): () => void {
		return buildQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, snapshotResults(snapshot)),
			error => dispatchError(observer, error),
		);
	}

	async setDocuments(ref: Documents, data: Data): Promise<void> {
		const writer = this.firestore.bulkWriter();
		const query = buildQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: typeof query | false = query;
		while (current) {
			const snapshot = await query.get();
			for (const s of snapshot.docs) void writer.set(s.ref, data);
			current = snapshot.size >= BATCH_SIZE && query.startAfter(snapshot.docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}

	async updateDocuments(ref: Documents, data: Partial<Data>): Promise<void> {
		const writer = this.firestore.bulkWriter();
		const query = buildQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: typeof query | false = query;
		while (current) {
			const snapshot = await query.get();
			for (const s of snapshot.docs) void writer.update(s.ref, data);
			current = snapshot.size >= BATCH_SIZE && query.startAfter(snapshot.docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}

	async deleteDocuments(ref: Documents): Promise<void> {
		const writer = this.firestore.bulkWriter();
		const query = buildQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
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
