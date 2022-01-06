import type { Database, DatabaseDocument } from "../db/index.js";
import type { PropUpdates, Update } from "../update/index.js";
import { Data, isNullish, Key, Nullish } from "../util/index.js";
import { WriteOperation } from "./WriteOperation.js";

/** Represent an update operation made to a single document in a database. */
export class UpdateOperation<T extends Data> extends WriteOperation {
	readonly collection: string;
	readonly id: string;
	readonly updates: PropUpdates<T>;
	constructor(collection: string, id: string, updates: PropUpdates<T>) {
		super();
		this.collection = collection;
		this.id = id;
		this.updates = updates;
	}
	async run(db: Database): Promise<this> {
		await db.doc(this.collection, this.id).update(this.updates);
		return this;
	}

	/** update one of the props on this set operation to a different value. */
	with<K extends Key<T>>(key: Nullish<K>, value: T[K] | Update<T[K]>): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, updates: { ...this.updates, [key]: value } };
	}
}

/** Create an update operation for a document. */
export const UPDATE = <T extends Data>({ collection, id }: DatabaseDocument<T>, updates: PropUpdates<T>): UpdateOperation<T> => new UpdateOperation(collection, id, updates);
