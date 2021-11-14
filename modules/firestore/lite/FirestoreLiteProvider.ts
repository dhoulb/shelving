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
	getDoc,
	orderBy,
	where,
	limit,
	addDoc,
	increment,
	arrayUnion,
	arrayRemove,
	deleteField,
	collection as getFirestoreCollection,
	doc as getFirestoreDoc,
	query as getFirestoreQuery,
	setDoc,
	updateDoc,
	deleteDoc,
	getDocs,
} from "firebase/firestore/lite";
import {
	Data,
	Results,
	Provider,
	ModelDocument,
	ModelQuery,
	FilterOperator,
	SortDirection,
	Mutable,
	Result,
	Transforms,
	AddItemsTransform,
	AddEntriesTransform,
	IncrementTransform,
	MutableObject,
	RemoveItemsTransform,
	RemoveEntriesTransform,
	ImmutableObject,
	AsynchronousProvider,
	Transform,
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

/** Get a Firestore DocumentReference for a given Shelving `Document` instance. */
function getDocumentReference<X extends Data>(firestore: Firestore, { collection, id }: ModelDocument<X>): FirestoreDocumentReference<X> {
	return getFirestoreDoc(firestore, collection, id) as FirestoreDocumentReference<X>;
}

/** Get a Firestore CollectionReference for a given Shelving `Document` instance. */
function getCollectionReference<X extends Data>(firestore: Firestore, { collection }: ModelQuery<X>): FirestoreCollectionReference<X> {
	return getFirestoreCollection(firestore, collection) as FirestoreCollectionReference<X>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQueryReference<X extends Data>(firestore: Firestore, ref: ModelQuery<X>): FirestoreQueryReference<X> {
	const { sorts, filters, slice } = ref;
	const constraints: FirestoreQueryConstraint[] = [];
	for (const { key, direction } of sorts) constraints.push(orderBy(key === "id" ? ID : key, DIRECTIONS[direction]));
	for (const { operator, key, value } of filters) constraints.push(where(key === "id" ? ID : key, OPERATORS[operator], value));
	if (slice.limit !== null) constraints.push(limit(slice.limit));
	return getFirestoreQuery(getCollectionReference(firestore, ref), ...constraints);
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
				output[key] = increment(transform.amount);
			} else if (transform instanceof AddItemsTransform) {
				output[key] = arrayUnion(...transform.items);
			} else if (transform instanceof RemoveItemsTransform) {
				output[key] = arrayRemove(...transform.items);
			} else if (transform instanceof AddEntriesTransform) {
				for (const [k, v] of Object.entries(transform.props)) output[`${key}.${k}`] = v;
			} else if (transform instanceof RemoveEntriesTransform) {
				for (const k of transform.props) output[`${key}.${k}`] = deleteField();
			} else throw Error("Unsupported transform");
		} else if (transform !== undefined) {
			output[key] = transform;
		}
	}
	return output;
}

/**
 * Firestore Lite client database provider.
 * - Works with the Firebase JS SDK.
 * - Does not support offline mode.
 * - Does not support realtime subscriptions.
 */
export class FirestoreClientProvider implements Provider, AsynchronousProvider {
	readonly firestore: Firestore;

	constructor(firestore: Firestore) {
		this.firestore = firestore;
	}

	async get<X extends Data>(ref: ModelDocument<X>): Promise<Result<X>> {
		const snapshot = await getDoc(getDocumentReference(this.firestore, ref));
		return snapshot.data();
	}

	subscribe(): () => void {
		throw new Error("FirestoreLiteProvider does not support realtime subscriptions");
	}

	async add<X extends Data>(ref: ModelQuery<X>, data: X): Promise<string> {
		const reference = await addDoc<any>(getCollectionReference(this.firestore, ref), data); // eslint-disable-line @typescript-eslint/no-explicit-any
		return reference.id;
	}

	async set<X extends Data>(ref: ModelDocument<X>, data: X): Promise<void> {
		await setDoc<any>(getDocumentReference(this.firestore, ref), data); // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	async update<X extends Data>(ref: ModelDocument<X>, transforms: Transforms<X>): Promise<void> {
		await updateDoc<any>(getDocumentReference(this.firestore, ref), convertTransforms(transforms)); // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	async delete<X extends Data>(ref: ModelDocument<X>): Promise<void> {
		await deleteDoc(getDocumentReference(this.firestore, ref));
	}

	async getQuery<X extends Data>(ref: ModelQuery<X>): Promise<Results<X>> {
		return getResults(await getDocs(getQueryReference(this.firestore, ref)));
	}

	subscribeQuery(): () => void {
		throw new Error("FirestoreLiteProvider does not support realtime subscriptions");
	}

	async setQuery<X extends Data>(ref: ModelQuery<X>, data: X): Promise<void> {
		const snapshot = await getDocs(getQueryReference(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => setDoc<any>(s.ref, data))); // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	async updateQuery<X extends Data>(ref: ModelQuery<X>, transforms: Transforms<X>): Promise<void> {
		const snapshot = await getDocs(getQueryReference(this.firestore, ref));
		const updates = convertTransforms(transforms);
		await Promise.all(snapshot.docs.map(s => updateDoc<any>(s.ref, updates))); // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	async deleteQuery<X extends Data>(ref: ModelQuery<X>): Promise<void> {
		const snapshot = await getDocs(getQueryReference(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
