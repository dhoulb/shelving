import "firebase/firestore";
import firebase from "firebase/app";
import {
	Dispatcher,
	ErrorDispatcher,
	arrayChunk,
	isObject,
	MutableObject,
	Change,
	Changes,
	Data,
	Result,
	Results,
	Provider,
	Document,
	Collection,
	Matcher,
	convertObject,
} from "..";

// Constants.
// const ID = "__name__"; // DH: `__name__` is the ID and the entire path of the document. `__id__` is just ID.
const ID = "__id__"; // Internal way Firestore Queries can reference the ID of the current document.
const DELETE = firebase.firestore.FieldValue.delete(); // Delete sentinel is used to mark fields for deletion.
const BATCH = 100; // Actual limit is 500 but smaller batches allow for additional reads etc in the request.

/** Map all `undefined` values in an object to the `DELETE` sentinel */
const mapSentinels = (value: unknown): unknown =>
	value === undefined ? DELETE : isObject(value) && !(value instanceof Array) ? convertObject(value, mapSentinels) : value;

// Map `Filter.types` to `WhereFilterOp`
const FILTERS: { [K in Matcher]: firebase.firestore.WhereFilterOp } = {
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
const buildQuery = <T extends Data>(
	firestore: firebase.firestore.Firestore,
	{ path, query: { filters, sorts, slice } }: Collection<T>,
): firebase.firestore.Query => {
	let query: firebase.firestore.Query = firestore.collection(path);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key.toString(), direction);
	for (const { type, key, value } of filters) query = query.where(key === "id" ? ID : key.toString(), FILTERS[type], value);
	if (slice.limit !== null) query = query.limit(slice.limit);
	return query;
};

/** Extract the correct value from a document snapshot. */
const collectionResult = <T extends Data>(ref: Collection<T>, snapshot: firebase.firestore.QueryDocumentSnapshot): T => ref.validate(snapshot.data());

/** Extract the correct value from a document snapshot. */
const documentResult = <T extends Data>(ref: Document<T>, snapshot: firebase.firestore.DocumentSnapshot): Result<T> => {
	const data = snapshot.data();
	return data && ref.validate(data);
};

type FirestoreOptions = {
	firestore: firebase.firestore.Firestore;
};

/**
 * Firestore client database provider.
 * - Works with the JS client SDK.
 * @todo Maybe find a way to generate a unique hash of
 */
class FirestoreClientProvider implements Provider {
	readonly firestore: firebase.firestore.Firestore;

	constructor({ firestore }: FirestoreOptions) {
		this.firestore = firestore;
	}

	async getDocument<T extends Data>(ref: Document<T>): Promise<Result<T>> {
		const doc = this.firestore.doc(ref.path);
		const snapshot = await doc.get();
		return documentResult(ref, snapshot);
	}

	onDocument<T extends Data>(ref: Document<T>, onNext: Dispatcher<Result<T>>, onError: ErrorDispatcher): () => void {
		return this.firestore.doc(ref.path).onSnapshot(s => onNext(documentResult(ref, s)), onError);
	}

	async addDocument<T extends Data>(ref: Collection<T>, data: T): Promise<string> {
		const { id } = await this.firestore.collection(ref.path).add(data);
		return id;
	}

	async mergeDocument<T extends Data>(ref: Document<T>, change: Change<T>): Promise<void> {
		await this.firestore.doc(ref.path).set(convertObject(change, mapSentinels), { merge: true });
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

	onCollection<T extends Data>(ref: Collection<T>, onNext: Dispatcher<Results<T>>, onError: ErrorDispatcher): () => void {
		return buildQuery(this.firestore, ref).onSnapshot(snapshot => {
			const next: MutableObject<T> = {};
			for (const s of snapshot.docs) next[s.id] = collectionResult(ref, s);
			onNext(next);
		}, onError);
	}

	async changeDocuments<T extends Data>(ref: Collection<T>, changes: Changes<T>): Promise<void> {
		// Chunk into batches of sets/deletes and commit each batch in order.
		// Don't commit the batches in parallel or you'll overwhelm the pipe.
		const entries = Object.entries(changes);
		const chunks = arrayChunk(entries, BATCH);
		for (const chunk of chunks) {
			const batch = this.firestore.batch();
			for (const [id, change] of chunk) {
				const docRef = this.firestore.doc(`${ref.path}/${id}`);
				if (change) batch.set(docRef, convertObject(change, mapSentinels), { merge: true });
				else batch.delete(docRef);
			}
			await batch.commit();
		}
	}
}

/** Create a new FirestoreClientProvider instance. */
export const provideFirestore = (options: FirestoreOptions): FirestoreClientProvider => new FirestoreClientProvider(options);
