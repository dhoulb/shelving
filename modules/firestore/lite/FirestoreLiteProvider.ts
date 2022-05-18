import type {
	Firestore,
	DocumentReference as FirestoreDocumentReference,
	CollectionReference as FirestoreCollectionReference,
	Query as FirestoreQueryReference,
	QuerySnapshot as FirestoreQuerySnapshot,
	QueryConstraint as FirestoreQueryConstraint,
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
} from "firebase/firestore/lite";
import {
	orderBy as firestoreOrderBy,
	where as firestoreWhere,
	limit as firestoreLimit,
	increment as firestoreIncrement,
	arrayUnion as firestoreArrayUnion,
	arrayRemove as firestoreArrayRemove,
	deleteField as firestoreDeleteField,
	collection as firestoreCollection,
	doc as firestoreDocument,
	query as firestoreQuery,
	setDoc,
	addDoc,
	updateDoc,
	deleteDoc,
	getDoc,
	getDocs,
} from "firebase/firestore/lite";
import {
	Provider,
	DocumentReference,
	QueryReference,
	FilterOperator,
	SortDirection,
	Result,
	Update,
	ObjectUpdate,
	Increment,
	AsynchronousProvider,
	Entry,
	Data,
	DataUpdate,
	Entries,
	Unsubscriber,
	ArrayUpdate,
	UnsupportedError,
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

/** Get a Firestore DocumentReference for a given document. */
function getDocument<T extends Data>(firestore: Firestore, { collection, id }: DocumentReference<T>): FirestoreDocumentReference<T> {
	return firestoreDocument(firestore, collection, id) as FirestoreDocumentReference<T>;
}

/** Get a Firestore CollectionReference for a given query. */
function getCollection<T extends Data>(firestore: Firestore, { collection }: QueryReference<T>): FirestoreCollectionReference<T> {
	return firestoreCollection(firestore, collection) as FirestoreCollectionReference<T>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<T extends Data>(firestore: Firestore, ref: QueryReference<T>): FirestoreQueryReference<T> {
	const { sorts, filters, limit } = ref;
	const constraints: FirestoreQueryConstraint[] = [];
	for (const { key, direction } of sorts) constraints.push(firestoreOrderBy(key === "id" ? ID : key, DIRECTIONS[direction]));
	for (const { operator, key, value } of filters) constraints.push(firestoreWhere(key === "id" ? ID : key, OPERATORS[operator], value));
	if (typeof limit === "number") constraints.push(firestoreLimit(limit));
	return firestoreQuery(getCollection(firestore, ref), ...constraints);
}

/** Create a set of results from a collection snapshot. */
function* getResults<T extends Data>(snapshot: FirestoreQuerySnapshot<T>): Entries<T> {
	for (const s of snapshot.docs) yield [s.id, s.data()];
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function* yieldFieldValues(updates: Iterable<Entry>, prefix = ""): Generator<Entry, void> {
	for (const [key, update] of updates) {
		if (update === undefined) yield [`${prefix}${key}`, firestoreDeleteField()];
		else if (update instanceof Increment) yield [`${prefix}${key}`, firestoreIncrement(update.amount)];
		else if (update instanceof DataUpdate || update instanceof ObjectUpdate) yield* yieldFieldValues(update, `${prefix}${key}.`);
		else if (update instanceof ArrayUpdate) {
			if (update.adds.length && update.deletes.length) throw new UnsupportedError("Cannot add/delete array items in one update");
			if (update.adds.length) yield [`${prefix}${key}`, firestoreArrayUnion(...update.adds)];
			else if (update.deletes.length) yield [`${prefix}${key}`, firestoreArrayRemove(...update.deletes)];
		} else yield [`${prefix}${key}`, update];
	}
}

/**
 * Firestore Lite client database provider.
 * - Works with the Firebase JS SDK.
 * - Does not support offline mode.
 * - Does not support realtime subscriptions.
 */
export class FirestoreClientProvider extends Provider implements AsynchronousProvider {
	readonly firestore: Firestore;

	constructor(firestore: Firestore) {
		super();
		this.firestore = firestore;
	}

	async get<T extends Data>(ref: DocumentReference<T>): Promise<Result<T>> {
		const snapshot = await getDoc(getDocument(this.firestore, ref));
		return snapshot.data() || null;
	}

	subscribe(): Unsubscriber {
		throw new Error("FirestoreLiteProvider does not support realtime subscriptions");
	}

	async add<T extends Data>(ref: QueryReference<T>, data: T): Promise<string> {
		const reference = await addDoc<any>(getCollection(this.firestore, ref), data); // eslint-disable-line @typescript-eslint/no-explicit-any
		return reference.id;
	}

	async set<T extends Data>(ref: DocumentReference<T>, data: T): Promise<void> {
		await setDoc<unknown>(getDocument(this.firestore, ref), data);
	}

	async update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): Promise<void> {
		const fieldValues = Object.fromEntries(yieldFieldValues(update));
		await updateDoc<unknown>(getDocument(this.firestore, ref), fieldValues);
	}

	async delete<T extends Data>(ref: DocumentReference<T>): Promise<void> {
		await deleteDoc(getDocument(this.firestore, ref));
	}

	async getQuery<T extends Data>(ref: QueryReference<T>): Promise<Entries<T>> {
		return getResults(await getDocs(getQuery(this.firestore, ref)));
	}

	subscribeQuery(): Unsubscriber {
		throw new Error("FirestoreLiteProvider does not support realtime subscriptions");
	}

	async setQuery<T extends Data>(ref: QueryReference<T>, data: T | Update<T> | undefined): Promise<number> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => setDoc<unknown>(s.ref, data)));
		return snapshot.size;
	}

	async updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): Promise<number> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		const fieldValues = Object.fromEntries(yieldFieldValues(update));
		await Promise.all(snapshot.docs.map(s => updateDoc<unknown>(s.ref, fieldValues)));
		return snapshot.size;
	}

	async deleteQuery<T extends Data>(ref: QueryReference<T>): Promise<number> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
		return snapshot.size;
	}
}
