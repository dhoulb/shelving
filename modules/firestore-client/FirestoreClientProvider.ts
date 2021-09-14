import firebase from "firebase/app";
import "firebase/firestore";
import type {
	FirebaseFirestore as Firestore,
	WhereFilterOp as FirestoreWhereFilterOp,
	OrderByDirection as FirestoreOrderByDirection,
	Query as FirestoreQuery,
	QuerySnapshot as FirestoreQuerySnapshot,
	DocumentReference as FirestoreDocumentReference,
	CollectionReference as FirestoreCollectionReference,
} from "@firebase/firestore-types";
import { Data, Results, Provider, Document, Documents, Operator, Direction, Mutable, Result, Observer, dispatchNext, dispatchError, Transforms } from "..";
import { AddItemsTransform, AddEntriesTransform, IncrementTransform, isTransform, MutableObject, RemoveItemsTransform, RemoveEntriesTransform } from "../util";

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
function getDocument<X extends Data>(firestore: Firestore, { path }: Document<X>): FirestoreDocumentReference<X> {
	return firestore.doc(path) as FirestoreDocumentReference<X>;
}

/** Get a Firestore CollectionReference for a given Shelving `Document` instance. */
function getCollection<X extends Data>(firestore: Firestore, { path }: Documents<X>): FirestoreCollectionReference<X> {
	return firestore.collection(path) as FirestoreCollectionReference<X>;
}

/** Create a corresponding `QueryReference` from a Query. */
function getQuery<X extends Data>(firestore: Firestore, ref: Documents<X>): FirestoreQuery<X> {
	const { sorts, filters, slice } = ref.query;
	let query: FirestoreQuery<X> = getCollection(firestore, ref);
	for (const { key, direction } of sorts) query = query.orderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) query = query.where(key === "id" ? ID : key, OPERATORS[operator], value);
	if (slice.limit !== null) query = query.limit(slice.limit);
	return query;
}

/** Create a set of results from a collection snapshot. */
function getResults<X extends Data>(snapshot: FirestoreQuerySnapshot<X>): Results<X> {
	const results: Mutable<Results<X>> = {};
	for (const s of snapshot.docs) results[s.id] = s.data();
	return results;
}

/** Convert a set of Shelving `Transform` instances into the corresponding Firestore `FieldValue` instances. */
function convertTransforms<X extends Data>(transforms: Transforms<X>) {
	const output: MutableObject = {};
	for (const [key, transform] of Object.entries(transforms)) {
		if (isTransform(transform)) {
			if (transform instanceof IncrementTransform) {
				output[key] = firebase.firestore.FieldValue.increment(transform.amount);
			} else if (transform instanceof AddItemsTransform) {
				output[key] = firebase.firestore.FieldValue.arrayUnion(...transform.items);
			} else if (transform instanceof RemoveItemsTransform) {
				output[key] = firebase.firestore.FieldValue.arrayRemove(...transform.items);
			} else if (transform instanceof AddEntriesTransform) {
				for (const [k, v] of Object.entries(transform.props)) output[`${key}.${k}`] = v;
			} else if (transform instanceof RemoveEntriesTransform) {
				for (const k of transform.props) output[`${key}.${k}`] = firebase.firestore.FieldValue.delete();
			} else throw Error("Unsupported transform");
		} else output[key] = transform;
	}
	return output;
}

/**
 * Firestore client database provider.
 * - Works with the JS client SDK.
 * @todo Maybe find a way to generate a unique hash of
 */
export class FirestoreClientProvider implements Provider {
	readonly firestore: Firestore;

	constructor(firestore: Firestore) {
		this.firestore = firestore;
	}

	async getDocument<X extends Data>(ref: Document<X>): Promise<Result<X>> {
		const snapshot = await getDocument(this.firestore, ref).get();
		return snapshot.data();
	}

	onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result<X>>): () => void {
		return getDocument(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, snapshot.data()),
			error => dispatchError(observer, error),
		);
	}

	async addDocument<X extends Data>(ref: Documents<X>, data: X): Promise<string> {
		return (await getCollection(this.firestore, ref).add(data)).id;
	}

	async setDocument<X extends Data>(ref: Document<X>, data: X): Promise<void> {
		await getDocument(this.firestore, ref).set(data);
	}

	async updateDocument<X extends Data>(ref: Document<X>, transforms: Transforms<X>): Promise<void> {
		const updates = convertTransforms(transforms);
		await getDocument(this.firestore, ref).update(updates);
	}

	async deleteDocument<X extends Data>(ref: Document<X>): Promise<void> {
		await getDocument(this.firestore, ref).delete();
	}

	async getDocuments<X extends Data>(ref: Documents<X>): Promise<Results<X>> {
		return getResults(await getQuery(this.firestore, ref).get());
	}

	onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): () => void {
		return getQuery(this.firestore, ref).onSnapshot(
			snapshot => dispatchNext(observer, getResults(snapshot)),
			error => dispatchError(observer, error),
		);
	}

	async setDocuments<X extends Data>(ref: Documents<X>, data: X): Promise<void> {
		const snapshot = await getQuery(this.firestore, ref).get();
		await Promise.all(snapshot.docs.map(s => s.ref.set(data)));
	}

	async updateDocuments<X extends Data>(ref: Documents<X>, transforms: Transforms<X>): Promise<void> {
		const snapshot = await getQuery(this.firestore, ref).get();
		const updates = convertTransforms(transforms);
		await Promise.all(snapshot.docs.map(s => s.ref.update(updates)));
	}

	async deleteDocuments<X extends Data>(ref: Documents<X>): Promise<void> {
		const snapshot = await getQuery(this.firestore, ref).get();
		await Promise.all(snapshot.docs.map(s => s.ref.delete()));
	}
}
