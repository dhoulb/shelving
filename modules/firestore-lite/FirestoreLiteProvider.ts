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
	Document,
	Documents,
	Operator,
	Direction,
	Mutable,
	Result,
	Transforms,
	AddItemsTransform,
	AddEntriesTransform,
	IncrementTransform,
	isTransform,
	MutableObject,
	RemoveItemsTransform,
	RemoveEntriesTransform,
	ImmutableObject,
	AsynchronousProvider,
} from "../index.js";

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
function getDocumentReference<X extends Data>(firestore: Firestore, { path }: Document<X>): FirestoreDocumentReference<X> {
	return getFirestoreDoc(firestore, path) as FirestoreDocumentReference<X>;
}

/** Get a Firestore CollectionReference for a given Shelving `Document` instance. */
function getCollectionReference<X extends Data>(firestore: Firestore, { path }: Documents<X>): FirestoreCollectionReference<X> {
	return getFirestoreCollection(firestore, path) as FirestoreCollectionReference<X>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQueryReference<X extends Data>(firestore: Firestore, ref: Documents<X>): FirestoreQueryReference<X> {
	const { sorts, filters, slice } = ref.query;
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
		if (isTransform(transform)) {
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

	async getDocument<X extends Data>(ref: Document<X>): Promise<Result<X>> {
		const snapshot = await getDoc(getDocumentReference(this.firestore, ref));
		return snapshot.data();
	}

	onDocument(): () => void {
		throw new Error("FirestoreLiteProvider does not support realtime subscriptions");
	}

	async addDocument<X extends Data>(ref: Documents<X>, data: X): Promise<string> {
		const reference = await addDoc<any>(getCollectionReference(this.firestore, ref), data); // eslint-disable-line @typescript-eslint/no-explicit-any
		return reference.id;
	}

	async setDocument<X extends Data>(ref: Document<X>, data: X): Promise<void> {
		await setDoc<any>(getDocumentReference(this.firestore, ref), data); // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	async updateDocument<X extends Data>(ref: Document<X>, transforms: Transforms<X>): Promise<void> {
		await updateDoc<any>(getDocumentReference(this.firestore, ref), convertTransforms(transforms)); // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	async deleteDocument<X extends Data>(ref: Document<X>): Promise<void> {
		await deleteDoc(getDocumentReference(this.firestore, ref));
	}

	async getDocuments<X extends Data>(ref: Documents<X>): Promise<Results<X>> {
		return getResults(await getDocs(getQueryReference(this.firestore, ref)));
	}

	onDocuments(): () => void {
		throw new Error("FirestoreLiteProvider does not support realtime subscriptions");
	}

	async setDocuments<X extends Data>(ref: Documents<X>, data: X): Promise<void> {
		const snapshot = await getDocs(getQueryReference(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => setDoc<any>(s.ref, data))); // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	async updateDocuments<X extends Data>(ref: Documents<X>, transforms: Transforms<X>): Promise<void> {
		const snapshot = await getDocs(getQueryReference(this.firestore, ref));
		const updates = convertTransforms(transforms);
		await Promise.all(snapshot.docs.map(s => updateDoc<any>(s.ref, updates))); // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	async deleteDocuments<X extends Data>(ref: Documents<X>): Promise<void> {
		const snapshot = await getDocs(getQueryReference(this.firestore, ref));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
	}
}
