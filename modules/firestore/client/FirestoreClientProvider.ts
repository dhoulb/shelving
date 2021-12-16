import type {
	Firestore,
	DocumentReference as FirestoreDocumentReference,
	CollectionReference as FirestoreCollectionReference,
	Query as FirestoreQueryReference,
	QuerySnapshot as FirestoreQuerySnapshot,
	QueryConstraint as FirestoreQueryConstraint,
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
} from "firebase/firestore";
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
	onSnapshot,
	addDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	getDoc,
	getDocs,
} from "firebase/firestore";
import {
	Results,
	Provider,
	DataDocument,
	DataQuery,
	FilterOperator,
	SortDirection,
	Result,
	Observer,
	dispatchNext,
	dispatchError,
	Update,
	EntriesUpdate,
	Increment,
	AsynchronousProvider,
	DataUpdate,
	AssertionError,
	Data,
	Unsubscriber,
	ItemsUpdate,
	UnsupportedError,
	Entry,
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

/** Get a Firestore DocumentReference for a given document. */
function getDocument<T extends Data>(firestore: Firestore, { collection, id }: DataDocument<T>): FirestoreDocumentReference<T> {
	return firestoreDocument(firestore, collection, id) as FirestoreDocumentReference<T>;
}

/** Get a Firestore CollectionReference for a given query. */
function getCollection<T extends Data>(firestore: Firestore, { collection }: DataQuery<T>): FirestoreCollectionReference<T> {
	return firestoreCollection(firestore, collection) as FirestoreCollectionReference<T>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<T extends Data>(firestore: Firestore, ref: DataQuery<T>): FirestoreQueryReference<T> {
	const { sorts, filters, limit } = ref;
	const constraints: FirestoreQueryConstraint[] = [];
	for (const { key, direction } of sorts) constraints.push(firestoreOrderBy(key === "id" ? ID : key, DIRECTIONS[direction]));
	for (const { operator, key, value } of filters) constraints.push(firestoreWhere(key === "id" ? ID : key, OPERATORS[operator], value));
	if (typeof limit === "number") constraints.push(firestoreLimit(limit));
	return firestoreQuery(getCollection(firestore, ref), ...constraints);
}

/** Create a set of results from a collection snapshot. */
function* getResults<T extends Data>(snapshot: FirestoreQuerySnapshot<T>): Results<T> {
	for (const s of snapshot.docs) yield [s.id, s.data()];
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function getFieldValues<T extends Data>(update: Update<T>): Data {
	if (update instanceof DataUpdate) return Object.fromEntries(yieldFieldValues(update));
	throw new AssertionError("Unsupported transform", update);
}
function* yieldFieldValues(updates: Iterable<Entry>, prefix = ""): Generator<Entry, void> {
	for (const [key, update] of updates) {
		if (!(update instanceof Update)) yield [`${prefix}${key}`, update !== undefined ? update : firestoreDeleteField()];
		else if (update instanceof Increment) yield [`${prefix}${key}`, firestoreIncrement(update.amount)];
		else if (update instanceof DataUpdate || update instanceof EntriesUpdate) yield* yieldFieldValues(update, `${prefix}${key}.`);
		else if (update instanceof ItemsUpdate) {
			if (update.adds.length && update.deletes.length) throw new UnsupportedError("Cannot add/delete array items in one update");
			if (update.adds.length) yield [`${prefix}${key}`, firestoreArrayUnion(...update.adds)];
			else if (update.deletes.length) yield [`${prefix}${key}`, firestoreArrayRemove(...update.deletes)];
		} else throw new AssertionError("Unsupported transform", update);
	}
}

/**
 * Firestore client database provider.
 * - Works with the Firebase JS SDK.
 * - Supports offline mode.
 * - Supports realtime subscriptions.
 */
export class FirestoreClientProvider extends Provider implements AsynchronousProvider {
	readonly firestore: Firestore;

	constructor(firestore: Firestore) {
		super();
		this.firestore = firestore;
	}

	async get<T extends Data>(ref: DataDocument<T>): Promise<Result<T>> {
		return (await getDoc(getDocument(this.firestore, ref))).data() || null;
	}

	subscribe<T extends Data>(ref: DataDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		return onSnapshot(
			getDocument(this.firestore, ref),
			snapshot => dispatchNext(observer, snapshot.data() || null),
			thrown => dispatchError(observer, thrown),
		);
	}

	async add<T extends Data>(ref: DataQuery<T>, data: T): Promise<string> {
		const reference = await addDoc<unknown>(getCollection(this.firestore, ref), data);
		return reference.id;
	}

	async set<T extends Data>(ref: DataDocument<T>, data: T): Promise<void> {
		await setDoc<unknown>(getDocument(this.firestore, ref), data);
	}

	async update<T extends Data>(ref: DataDocument<T>, updates: Update<T>): Promise<void> {
		await updateDoc<unknown>(getDocument(this.firestore, ref), getFieldValues(updates));
	}

	async delete<T extends Data>(ref: DataDocument<T>): Promise<void> {
		await deleteDoc(getDocument(this.firestore, ref));
	}

	async getQuery<T extends Data>(ref: DataQuery<T>): Promise<Results<T>> {
		return getResults(await getDocs(getQuery(this.firestore, ref)));
	}

	subscribeQuery<T extends Data>(ref: DataQuery<T>, observer: Observer<Results<T>>): Unsubscriber {
		return onSnapshot(
			getQuery(this.firestore, ref),
			snapshot => dispatchNext(observer, getResults(snapshot)),
			thrown => dispatchError(observer, thrown),
		);
	}

	async setQuery<T extends Data>(ref: DataQuery<T>, data: T): Promise<number> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => setDoc<unknown>(s.ref, data)));
		return snapshot.size;
	}

	async updateQuery<T extends Data>(ref: DataQuery<T>, updates: Update<T>): Promise<number> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		const fieldValues = getFieldValues(updates);
		await Promise.all(snapshot.docs.map(s => updateDoc<unknown>(s.ref, fieldValues)));
		return snapshot.size;
	}

	async deleteQuery<T extends Data>(ref: DataQuery<T>): Promise<number> {
		const snapshot = await getDocs(getQuery(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
		return snapshot.size;
	}
}
