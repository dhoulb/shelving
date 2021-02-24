import type {
	FirebaseFirestore as Firestore,
	WhereFilterOp as FirestoreWhereFilterOp,
	Query as FirestoreQuery,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	DocumentSnapshot as FirestoreDocumentSnapshot,
} from "@firebase/firestore-types";
import type { MutableObject, Data, Result, Results, Provider, Document, Collection, Operator, Stream } from "..";

// Constants.
// const ID = "__name__"; // DH: `__name__` is the ID and the entire path of the document. `__id__` is just ID.
const ID = "__id__"; // Internal way Firestore Queries can reference the ID of the current document.

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS: { readonly [K in Operator]: FirestoreWhereFilterOp } = {
	is: "==",
	not: "!=",
	in: "in",
	gt: ">",
	gte: ">=",
	lt: "<",
	lte: "<=",
	contains: "array-contains",
};

/** Create a corresponding `QueryReference` from a Query. */
const buildQuery = <T extends Data>(firestore: Firestore, { path, query: { filters, sorts, slice } }: Collection<T>): FirestoreQuery => {
	let query: FirestoreQuery = firestore.collection(path);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, direction);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (slice.limit !== null) query = query.limit(slice.limit);
	return query;
};

/** Extract the correct value from a document snapshot. */
const collectionResult = <T extends Data>(ref: Collection<T>, snapshot: FirestoreQueryDocumentSnapshot): T => ref.validate(snapshot.data());

/** Extract the correct value from a document snapshot. */
const documentResult = <T extends Data>(ref: Document<T>, snapshot: FirestoreDocumentSnapshot): Result<T> => {
	const data = snapshot.data();
	return data && ref.validate(data);
};

type FirestoreOptions = {
	firestore: Firestore;
};

/**
 * Firestore client database provider.
 * - Works with the JS client SDK.
 * @todo Maybe find a way to generate a unique hash of
 */
class FirestoreClientProvider implements Provider {
	readonly firestore: Firestore;

	constructor({ firestore }: FirestoreOptions) {
		this.firestore = firestore;
	}

	async getDocument<T extends Data>(ref: Document<T>): Promise<Result<T>> {
		const doc = this.firestore.doc(ref.path);
		const snapshot = await doc.get();
		return documentResult(ref, snapshot);
	}

	onDocument<T extends Data>(ref: Document<T>, stream: Stream<Result<T>>): () => void {
		return this.firestore.doc(ref.path).onSnapshot(
			snapshot => stream.next(documentResult(ref, snapshot)),
			error => stream.error(error),
		);
	}

	async addDocument<T extends Data>(ref: Collection<T>, data: T): Promise<string> {
		const { id } = await this.firestore.collection(ref.path).add(data);
		return id;
	}

	async setDocument<T extends Data>(ref: Document<T>, data: T): Promise<void> {
		await this.firestore.doc(ref.path).set(data);
	}

	async updateDocument<T extends Data>(ref: Document<T>, partial: Partial<T>): Promise<void> {
		await this.firestore.doc(ref.path).update(partial);
	}

	async deleteDocument<T extends Data>(ref: Document<T>): Promise<void> {
		await this.firestore.doc(ref.path).delete();
		return undefined;
	}

	async getCollection<T extends Data>(ref: Collection<T>): Promise<Results<T>> {
		const snapshot = await buildQuery(this.firestore, ref).get();
		const results: MutableObject<T> = {};
		for (const s of snapshot.docs) results[s.id] = collectionResult(ref, s);
		return results;
	}

	// Count the documents in the collection.
	// Note: Firestore will charge you for reading every document in this collection!
	// If you're going to read the documents anyway, don't count before reading or you'll be charged twice and it'll take twice as long.
	async countCollection<T extends Data>(ref: Collection<T>): Promise<number> {
		const snapshot = await buildQuery(this.firestore, ref).get();
		return snapshot.size;
	}

	onCollection<T extends Data>(ref: Collection<T>, stream: Stream<Results<T>>): () => void {
		return buildQuery(this.firestore, ref).onSnapshot(
			snapshot => {
				const next: MutableObject<T> = {};
				for (const s of snapshot.docs) next[s.id] = collectionResult(ref, s);
				stream.next(next);
			},
			error => stream.error(error),
		);
	}
}

/** Create a new FirestoreClientProvider instance. */
export const provideFirestore = (options: FirestoreOptions): FirestoreClientProvider => new FirestoreClientProvider(options);
