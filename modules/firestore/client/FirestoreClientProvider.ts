import {
	Firestore,
	DocumentSnapshot as FirestoreDocumentSnapshot,
	Query as FirestoreQueryReference,
	QuerySnapshot as FirestoreQuerySnapshot,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	QueryConstraint as FirestoreQueryConstraint,
	FieldValue as FirestoreFieldValue,
	documentId as firestoreDocumentId,
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
import type { Data } from "../../util/data.js";
import type { Entry } from "../../util/entry.js";
import type { AsyncProvider } from "../../provider/Provider.js";
import type { ItemArray, ItemValue, ItemData, ItemConstraints } from "../../db/Item.js";
import { LazyDeferredSequence } from "../../sequence/LazyDeferredSequence.js";
import { ArrayUpdate, DataUpdate, Updates, Increment, DictionaryUpdate, Delete, Update } from "../../update/index.js";

// Constants.
const ID = firestoreDocumentId();

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS = {
	IS: "==",
	NOT: "!=",
	IN: "in",
	OUT: "not-in",
	CONTAINS: "array-contains",
	GT: ">",
	GTE: ">=",
	LT: "<",
	LTE: "<=",
} as const;

// Map `Filter.types` to `OrderByDirection`
const DIRECTIONS = {
	ASC: "asc",
	DESC: "desc",
} as const;

/** Get a Firestore QueryReference for a given query. */
function _getQuery(firestore: Firestore, collection: string, constraints: ItemConstraints): FirestoreQueryReference {
	return firestoreQuery(firestoreCollection(firestore, collection), ..._yieldQueryConstraints(constraints));
}
function* _yieldQueryConstraints({ sorts, filters, limit }: ItemConstraints): Iterable<FirestoreQueryConstraint> {
	for (const { key, direction } of sorts) yield firestoreOrderBy(key === "id" ? ID : key, DIRECTIONS[direction]);
	for (const { operator, key, value } of filters) yield firestoreWhere(key, OPERATORS[operator], value);
	if (typeof limit === "number") yield firestoreLimit(limit);
}

function _getItems<T extends Data>(snapshot: FirestoreQuerySnapshot<T>): ItemArray<T> {
	return snapshot.docs.map(_getItemData);
}

function _getItemData<T extends Data>(snapshot: FirestoreQueryDocumentSnapshot<T>): ItemData<T> {
	const data = snapshot.data();
	return { ...data, id: snapshot.id };
}

function _getItemValue<T extends Data>(snapshot: FirestoreDocumentSnapshot<T>): ItemValue<T> {
	const data = snapshot.data();
	return data ? { ...data, id: snapshot.id } : null;
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function* _getFieldValues<T>(updates: Iterable<Entry<string, T | Update<T> | ArrayUpdate<T>>>, prefix = ""): Iterable<string | T | FirestoreFieldValue> {
	for (const [key, update] of updates) {
		if (update instanceof DataUpdate || update instanceof DictionaryUpdate) {
			yield* _getFieldValues(update, `${prefix}${key}.`);
		} else if (update instanceof ArrayUpdate) {
			if (update.adds.length) {
				yield `${prefix}${key}`;
				yield firestoreArrayUnion(...update.adds);
			}
			if (update.deletes.length) {
				yield `${prefix}${key}`;
				yield firestoreArrayRemove(...update.deletes);
			}
		} else {
			yield `${prefix}${key}`;
			if (!(update instanceof Update)) yield update;
			else if (update instanceof Delete) yield firestoreDeleteField();
			else if (update instanceof Increment) yield firestoreIncrement(update.amount);
			else yield update.transform();
		}
	}
}

/**
 * Firestore client database provider.
 * - Works with the Firebase JS SDK.
 * - Supports offline mode.
 * - Supports realtime subscriptions.
 */
export class FirestoreClientProvider implements AsyncProvider {
	private readonly _firestore: Firestore;
	constructor(firestore: Firestore) {
		this._firestore = firestore;
	}
	async getItem(collection: string, id: string): Promise<ItemValue> {
		return _getItemValue(await getDoc(firestoreDocument(this._firestore, collection, id)));
	}
	getItemSequence(collection: string, id: string): AsyncIterable<ItemValue> {
		return new LazyDeferredSequence(({ resolve, reject }) =>
			onSnapshot(
				firestoreDocument(this._firestore, collection, id), //
				snapshot => resolve(_getItemValue(snapshot)),
				reject,
			),
		);
	}
	async addItem(collection: string, data: Data): Promise<string> {
		const reference = await addDoc(firestoreCollection(this._firestore, collection), data);
		return reference.id;
	}
	async setItem(collection: string, id: string, data: Data): Promise<void> {
		await setDoc(firestoreDocument(this._firestore, collection, id), data);
	}
	async updateItem(collection: string, id: string, updates: Updates): Promise<void> {
		await updateDoc(firestoreDocument(this._firestore, collection, id), ...(_getFieldValues(Object.entries(updates)) as [string, unknown]));
	}
	async deleteItem(collection: string, id: string): Promise<void> {
		await deleteDoc(firestoreDocument(this._firestore, collection, id));
	}
	async getQuery(collection: string, constraints: ItemConstraints): Promise<ItemArray> {
		return _getItems(await getDocs(_getQuery(this._firestore, collection, constraints)));
	}
	getQuerySequence(collection: string, constraints: ItemConstraints): AsyncIterable<ItemArray> {
		return new LazyDeferredSequence(({ resolve, reject }) =>
			onSnapshot(
				_getQuery(this._firestore, collection, constraints), //
				snapshot => resolve(_getItems(snapshot)),
				reject,
			),
		);
	}
	async setQuery(collection: string, constraints: ItemConstraints, data: Data): Promise<number> {
		const snapshot = await getDocs(_getQuery(this._firestore, collection, constraints));
		await Promise.all(snapshot.docs.map(s => setDoc(s.ref, data)));
		return snapshot.size;
	}
	async updateQuery(collection: string, constraints: ItemConstraints, updates: Updates): Promise<number> {
		const snapshot = await getDocs(_getQuery(this._firestore, collection, constraints));
		const fieldValues = Array.from(_getFieldValues(Object.entries(updates))) as [string, unknown];
		await Promise.all(snapshot.docs.map(s => updateDoc(s.ref, ...fieldValues)));
		return snapshot.size;
	}
	async deleteQuery(collection: string, constraints: ItemConstraints): Promise<number> {
		const snapshot = await getDocs(_getQuery(this._firestore, collection, constraints));
		await Promise.all(snapshot.docs.map(s => deleteDoc(s.ref)));
		return snapshot.size;
	}
}
