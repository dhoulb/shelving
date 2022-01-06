import type { Database, DatabaseDocument } from "../db/index.js";
import { Data, isNullish, Key, Nullish } from "../util/index.js";
import { WriteOperation } from "./WriteOperation.js";

/** Represent a set operation made to a single document in a database. */
export class SetOperation<T extends Data> extends WriteOperation {
	readonly collection: string;
	readonly id: string;
	readonly data: T;
	constructor(collection: string, id: string, data: T) {
		super();
		this.collection = collection;
		this.id = id;
		this.data = data;
	}
	async run(db: Database): Promise<this> {
		await db.doc(this.collection, this.id).set(this.data);
		return this;
	}

	/** Set one of the props on this set operation to a different value. */
	with<K extends Key<T>>(key: Nullish<K>, value: T[K]): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, data: { ...this.data, [key]: value } };
	}
}

/** Create a set operation for a document. */
export const SET = <T extends Data>({ collection, id }: DatabaseDocument<T>, data: T): SetOperation<T> => new SetOperation(collection, id, data);
