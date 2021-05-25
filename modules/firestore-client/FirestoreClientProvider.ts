import "firebase/app";
import "firebase/firestore";
import type {
	FirebaseFirestore as Firestore,
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	Query as FirestoreQuery,
	QuerySnapshot as FirestoreQuerySnapshot,
} from "@firebase/firestore-types";
import {
	DocumentRequiredError,
	isObject,
	Data,
	Results,
	Provider,
	Document,
	Documents,
	Operator,
	Direction,
	Mutable,
	Result,
	Observer,
	dispatchNext,
} from "..";
import { dispatchError } from "../stream";

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
	return query;
};

/** Create a set of results from a collection snapshot. */
const snapshotResults = (snapshot: FirestoreQuerySnapshot): Results => {
	const results: Mutable<Results> = {};
	for (const s of snapshot.docs) results[s.id] = s.data();
	return results;
};

type FirestoreClientProviderOptions = {
	readonly firestore: Firestore;
};

/**
 * Firestore client database provider.
 * - Works with the JS client SDK.
 * @todo Maybe find a way to generate a unique hash of
 */
export class FirestoreClientProvider implements Provider {
	/** Create a new FirestoreClientProvider. */
	static create(options: FirestoreClientProviderOptions): FirestoreClientProvider {
		return new FirestoreClientProvider(options);
	}

	readonly VALIDATE = true;
	readonly firestore: Firestore;

	protected constructor({ firestore }: FirestoreClientProviderOptions) {
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

	async updateDocument(ref: Document, partial: Data): Promise<void> {
		try {
			await this.firestore.doc(ref.path).update(partial);
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

	// Count the documents in the collection.
	// Note: Firestore will charge you for reading every document in this collection!
	// If you're going to read the documents anyway, don't count before reading or you'll be charged twice and it'll take twice as long.
	async countDocuments(ref: Documents): Promise<number> {
		const snapshot = await buildQuery(this.firestore, ref).get();
		return snapshot.size;
	}

	onDocuments(ref: Documents, observer: Observer<Results>): () => void {
		return buildQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, snapshotResults(snapshot)),
			error => dispatchError(observer, error),
		);
	}

	async setDocuments(ref: Documents, data: Data): Promise<void> {
		const snapshot = await buildQuery(this.firestore, ref).get();
		await Promise.all(snapshot.docs.map(s => s.ref.set(data)));
	}

	async updateDocuments(ref: Documents, partial: Data): Promise<void> {
		const snapshot = await buildQuery(this.firestore, ref).get();
		await Promise.all(snapshot.docs.map(s => s.ref.update(partial)));
	}

	async deleteDocuments(ref: Documents): Promise<void> {
		const snapshot = await buildQuery(this.firestore, ref).get();
		await Promise.all(snapshot.docs.map(s => s.ref.delete()));
	}
}
