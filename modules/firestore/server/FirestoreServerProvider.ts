import type {
	BulkWriter as FirestoreBulkWriter,
	CollectionReference as FirestoreCollectionReference,
	DocumentSnapshot as FirestoreDocumentSnapshot,
	QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
	Query as FirestoreQueryReference,
	QuerySnapshot as FirestoreQuerySnapshot,
	UpdateData as FirestoreUpdateData,
} from "@google-cloud/firestore";
import { FieldPath, FieldValue, Firestore } from "@google-cloud/firestore";
import type { Collection } from "../../db/collection/Collection.js";
import { DBProvider } from "../../db/provider/DBProvider.js";
import { DeferredSequence } from "../../sequence/DeferredSequence.js";
import { LazySequence } from "../../sequence/LazySequence.js";
import type { Data, DataProp } from "../../util/data.js";
import { joinDataKey } from "../../util/data.js";
import type { Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import { getObject } from "../../util/object.js";
import { getQueryFilters, getQueryLimit, getQueryOrders, type Query } from "../../util/query.js";
import { mapItems } from "../../util/transform.js";
import type { Update, Updates } from "../../util/update.js";
import { getUpdates } from "../../util/update.js";

// Constants.
const ID = FieldPath.documentId();
const BATCH_SIZE = 1000;

// Map `Filter.types` to `WhereFilterOp`
const OPERATORS = {
	is: "==",
	not: "!=",
	in: "in",
	out: "not-in",
	contains: "array-contains",
	gt: ">",
	gte: ">=",
	lt: "<",
	lte: "<=",
} as const;

function _getItems<II extends string, TT extends Data>(snapshot: FirestoreQuerySnapshot<TT>): Items<II, TT> {
	return snapshot.docs.map(s => _getItem<II, TT>(s));
}

function _getItem<II extends string, TT extends Data>(snapshot: FirestoreQueryDocumentSnapshot<TT>): Item<II, TT> {
	return getItem(snapshot.id as II, snapshot.data()); // `as II` needed: Firestore snapshot.id is always string, not II.
}

function _getOptionalItem<II extends string, TT extends Data>(snapshot: FirestoreDocumentSnapshot<TT>): OptionalItem<II, TT> {
	const data = snapshot.data();
	if (data) return getItem(snapshot.id as II, data); // `as II` needed: Firestore snapshot.id is always string, not II.
}

/** Convert `Update` instances into corresponding Firestore `FieldValue` instances. */
function _getFieldValues<TT extends Data>(updates: Updates<TT>): FirestoreUpdateData<TT> {
	return getObject(mapItems(getUpdates(updates), _getFieldValue)) as FirestoreUpdateData<TT>;
}
function _getFieldValue({ key, action, value }: Update): DataProp<Data> {
	const k = joinDataKey(key);
	if (action === "set") return [k, value];
	if (action === "sum") return [k, FieldValue.increment(value)];
	if (action === "with") return [k, FieldValue.arrayUnion(...value)];
	if (action === "omit") return [k, FieldValue.arrayRemove(...value)];
	return action; // Never happens.
}

/**
 * Firestore server database provider.
 * - Works with the Firebase Admin SDK for Node.JS
 */
export class FirestoreServerProvider<I extends string = string, T extends Data = Data> extends DBProvider<I, T> {
	private readonly _firestore: Firestore;

	constructor(firestore = new Firestore()) {
		super();
		this._firestore = firestore;
	}

	/** Create a corresponding `FirestoreCollection` reference from a collection. */
	private _getCollection<TT extends T>(collection: Collection<string, I, TT>): FirestoreCollectionReference<TT> {
		return this._firestore.collection(collection.name) as FirestoreCollectionReference<TT>;
	}

	/** Create a corresponding `FirestoreQuery` reference from a collection and query. */
	private _getQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): FirestoreQueryReference<TT> {
		let ref: FirestoreQueryReference<TT> = this._getCollection(c);
		if (q) {
			for (const { key, direction } of getQueryOrders(q)) {
				const k = joinDataKey(key);
				ref = ref.orderBy(k === "id" ? ID : k, direction);
			}
			for (const { key, operator, value } of getQueryFilters(q)) {
				const k = joinDataKey(key);
				ref = ref.where(k === "id" ? ID : k, OPERATORS[operator], value);
			}
			const l = getQueryLimit(q);
			if (typeof l === "number") ref = ref.limit(l);
		}
		return ref;
	}

	/** Perform a bulk update on a set of documents using a `BulkWriter` */
	private async _bulkWrite<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		q: Query<Item<II, TT>>,
		callback: (writer: FirestoreBulkWriter, snapshot: FirestoreQueryDocumentSnapshot) => void,
	): Promise<void> {
		const writer = this._firestore.bulkWriter();
		const ref = this._getQuery(c, q).limit(BATCH_SIZE).select(); // `select()` turns the query into a field mask query (with no field masks) which saves data transfer and memory.
		let current: FirestoreQueryReference | false = ref;
		while (current) {
			const { docs, size } = await current.get();
			for (const s of docs) callback(writer, s);
			current = size >= BATCH_SIZE && ref.startAfter(docs.pop()).select();
			void writer.flush();
		}
		await writer.close();
	}

	async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return _getOptionalItem<II, TT>(await this._getCollection(collection).doc(id).get());
	}

	getItemSequence<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		const ref = this._getCollection(c).doc(id);
		const sequence = new DeferredSequence<OptionalItem<II, TT>>();
		return new LazySequence(sequence, () =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getOptionalItem<II, TT>(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}

	async addItem<II extends I, TT extends T>(c: Collection<string, II, TT>, data: TT): Promise<II> {
		return (await this._getCollection(c).add(data)).id as II; // `as II` needed: Firestore returns string, not II.
	}

	async setItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await this._getCollection(c).doc(id).set(data);
	}

	async updateItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II, updates: Updates<Item<II, TT>>): Promise<void> {
		await this._getCollection(c).doc(id).update(_getFieldValues(updates));
	}

	async deleteItem<II extends I, TT extends T>(c: Collection<string, II, TT>, id: II): Promise<void> {
		await this._getCollection(c).doc(id).delete();
	}

	override async countQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<number> {
		const snapshot = await this._getQuery(c, q).count().get();
		return snapshot.data().count;
	}

	async getQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): Promise<Items<II, TT>> {
		return _getItems<II, TT>(await this._getQuery(c, q).get());
	}

	getQuerySequence<II extends I, TT extends T>(c: Collection<string, II, TT>, q?: Query<Item<II, TT>>): ItemsSequence<II, TT> {
		const ref = this._getQuery(c, q);
		const sequence = new DeferredSequence<Items<II, TT>>();
		return new LazySequence(sequence, () =>
			ref.onSnapshot(
				snapshot => sequence.resolve(_getItems<II, TT>(snapshot)),
				reason => sequence.reject(reason),
			),
		);
	}

	async setQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>, data: TT): Promise<void> {
		return await this._bulkWrite(c, q, (w, s) => void w.set(s.ref, data));
	}

	async updateQuery<II extends I, TT extends T>(
		c: Collection<string, II, TT>,
		q: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		const fieldValues = _getFieldValues(updates);
		return await this._bulkWrite(c, q, (w, s) => void w.update(s.ref, fieldValues));
	}

	async deleteQuery<II extends I, TT extends T>(c: Collection<string, II, TT>, q: Query<Item<II, TT>>): Promise<void> {
		return await this._bulkWrite(c, q, (w, s) => void w.delete(s.ref));
	}
}
