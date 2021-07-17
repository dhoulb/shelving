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
const buildQuery = <T extends Data>(firestore: Firestore, { path, query: { filters, sorts, slice } }: Documents<T>): FirestoreQuery<T> => {
	let query: FirestoreQuery = firestore.collection(path);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (slice.limit !== null) query = query.limit(slice.limit);
	return query as FirestoreQuery<T>;
};

/** Create a set of results from a collection snapshot. */
const snapshotResults = <T extends Data>(snapshot: FirestoreQuerySnapshot<T>): Results<T> => {
	const results: Mutable<Results<T>> = {};
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

	async getDocument<T extends Data>(ref: Document<T>): Promise<Result<T>> {
		const doc = this.firestore.doc(ref.path);
		const snapshot = await doc.get();
		return snapshot.data() as Result<T>;
	}

	onDocument<T extends Data>(ref: Document<T>, observer: Observer<Result<T>>): () => void {
		return this.firestore.doc(ref.path).onSnapshot(
			snapshot => dispatchNext(observer, snapshot.data() as Result<T>),
			error => dispatchError(observer, error),
		);
	}

	async addDocument<T extends Data>(ref: Documents<T>, data: Data): Promise<string> {
		const { id } = await this.firestore.collection(ref.path).add(data);
		return id;
	}

	async setDocument<T extends Data>(ref: Document<T>, data: Data): Promise<void> {
		await this.firestore.doc(ref.path).set(data);
	}

	async updateDocument<T extends Data>(ref: Document<T>, partial: Partial<T>): Promise<void> {
		try {
			await this.firestore.doc(ref.path).update(partial);
		} catch (thrown: unknown) {
			if (isObject(thrown) && thrown.code === "not-found") throw new DocumentRequiredError(ref);
			throw thrown;
		}
	}

	async deleteDocument<T extends Data>(ref: Document<T>): Promise<void> {
		await this.firestore.doc(ref.path).delete();
		return undefined;
	}

	async getDocuments<T extends Data>(ref: Documents<T>): Promise<Results<T>> {
		const snapshot = await buildQuery(this.firestore, ref).get();
		return snapshotResults(snapshot);
	}

	onDocuments<T extends Data>(ref: Documents<T>, observer: Observer<Results<T>>): () => void {
		return buildQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, snapshotResults(snapshot)),
			error => dispatchError(observer, error),
		);
	}

	async setDocuments<T extends Data>(ref: Documents<T>, data: T): Promise<void> {
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

	async updateDocuments<T extends Data>(ref: Documents<T>, partial: Partial<T>): Promise<void> {
		const writer = this.firestore.bulkWriter();
		const query = buildQuery(this.firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: typeof query | false = query;
		while (current) {
			const snapshot = await query.get();
			for (const s of snapshot.docs) void writer.update(s.ref, partial);
			current = snapshot.size >= BATCH_SIZE && query.startAfter(snapshot.docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}

	async deleteDocuments<T extends Data>(ref: Documents<T>): Promise<void> {
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
