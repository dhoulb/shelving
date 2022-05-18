import type {
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	Query as FirestoreQuery,
	QuerySnapshot as FirestoreQuerySnapshot,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	DocumentReference as FirestoreDocumentReference,
	CollectionReference as FirestoreCollectionReference,
	BulkWriter as FirestoreBulkWriter,
} from "@google-cloud/firestore";
import { Firestore, FieldValue } from "@google-cloud/firestore";
import {
	Provider,
	DocumentReference,
	QueryReference,
	FilterOperator,
	Observer,
	SortDirection,
	Result,
	dispatchNext,
	dispatchError,
	Update,
	Increment,
	Data,
	AsynchronousProvider,
	DataUpdate,
	AssertionError,
	Entry,
	Entries,
	Unsubscriber,
	ArrayUpdate,
	UnsupportedError,
	ObjectUpdate,
} from "../../index.js";

// Constants.
// const ID = "__name__"; // DH: `__name__` is the entire path of the document. `__id__` is just ID.
const ID = "__id__"; // Internal way Firestore Queries can reference the ID of the current document.

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS: { readonly [K in FilterOperator]: FirestoreWhereFilterOp } = {
	IS: "==",
	NOT: "!=",
	IN: "in",
	OUT: "not-in",
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
function getDocument<T extends Data>(firestore: Firestore, { collection, id }: DocumentReference<T>): FirestoreDocumentReference<T> {
	return firestore.doc(`${collection}/${id}`) as FirestoreDocumentReference<T>;
}

/** Get a Firestore CollectionReference for a given document. */
function getCollection<T extends Data>(firestore: Firestore, { collection }: QueryReference<T>): FirestoreCollectionReference<T> {
	return firestore.collection(collection) as FirestoreCollectionReference<T>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<T extends Data>(firestore: Firestore, ref: QueryReference<T>): FirestoreQuery<T> {
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

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function* yieldFieldValues(updates: Iterable<Entry>, prefix = ""): Iterable<Entry> {
	for (const [key, update] of updates) {
		if (!(update instanceof Update)) yield [`${prefix}${key}`, update !== undefined ? update : FieldValue.delete()];
		else if (update instanceof Increment) yield [`${prefix}${key}`, FieldValue.increment(update.amount)];
		else if (update instanceof DataUpdate || update instanceof ObjectUpdate) yield* yieldFieldValues(update, `${prefix}${key}.`);
		else if (update instanceof ArrayUpdate) {
			if (update.adds.length && update.deletes.length) throw new UnsupportedError("Cannot add/delete array items in one update");
			if (update.adds.length) yield [`${prefix}${key}`, FieldValue.arrayUnion(...update.adds)];
			else if (update.deletes.length) yield [`${prefix}${key}`, FieldValue.arrayRemove(...update.deletes)];
		} else throw new AssertionError("Unsupported transform", update);
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

	async get<T extends Data>(ref: DocumentReference<T>): Promise<Result<T>> {
		return (await getDocument(this.firestore, ref).get()).data() || null;
	}

	subscribe<T extends Data>(ref: DocumentReference<T>, observer: Observer<Result<T>>): Unsubscriber {
		return getDocument(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, snapshot.data() || null),
			thrown => dispatchError(observer, thrown),
		);
	}

	async add<T extends Data>(ref: QueryReference<T>, data: T): Promise<string> {
		return (await getCollection(this.firestore, ref).add(data)).id;
	}

	async set<T extends Data>(ref: DocumentReference<T>, data: T): Promise<void> {
		await getDocument(this.firestore, ref).set(data);
	}

	async update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): Promise<void> {
		const fieldValues = Object.fromEntries(yieldFieldValues(update)) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
		await getDocument(this.firestore, ref).update(fieldValues);
	}

	async delete<T extends Data>(ref: DocumentReference<T>): Promise<void> {
		await getDocument(this.firestore, ref).delete();
	}

	async getQuery<T extends Data>(ref: QueryReference<T>): Promise<Iterable<Entry<T>>> {
		return getResults(await getQuery(this.firestore, ref).get());
	}

	subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: Observer<Entries<T>>): Unsubscriber {
		return getQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, getResults(snapshot)),
			thrown => dispatchError(observer, thrown),
		);
	}

	async setQuery<T extends Data>(ref: QueryReference<T>, data: T | Update<T> | undefined): Promise<number> {
		return await bulkWrite(this.firestore, ref, (w, s) => void w.set(s.ref, data));
	}

	async updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): Promise<number> {
		const fieldValues = Object.fromEntries(yieldFieldValues(update)) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
		return await bulkWrite(this.firestore, ref, (w, s) => void w.update(s.ref, fieldValues));
	}

	async deleteQuery<T extends Data>(ref: QueryReference<T>): Promise<number> {
		return await bulkWrite(this.firestore, ref, (w, s) => void w.delete(s.ref));
	}
}

/** Perform a bulk update on a set of documents using a `BulkWriter` */
async function bulkWrite<T extends Data>(firestore: Firestore, ref: QueryReference<T>, callback: (writer: FirestoreBulkWriter, snapshot: FirestoreQueryDocumentSnapshot) => void): Promise<number> {
	let count = 0;
	const writer = firestore.bulkWriter();
	const query = getQuery(firestore, ref).limit(BATCH_SIZE).select(); // `select()` turs the query into a field mask query (with no field masks) which saves data transfer and memory.
	let current: FirestoreQuery | false = query;
	while (current) {
		const { docs, size }: FirestoreQuerySnapshot = await current.get();
		count += size;
		for (const s of docs) callback(writer, s);
		current = size >= BATCH_SIZE && query.startAfter(docs.pop()).select();
		void writer.flush();
	}
	await writer.close();
	return count;
}

const BATCH_SIZE = 1000;
