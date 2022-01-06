import type { Database, DatabaseQuery } from "../db/index.js";
import { Data, Nullish, isNullish, Key } from "../util/index.js";
import { SetOperation } from "./SetOperation.js";
import { WriteOperation } from "./WriteOperation.js";

/** Represent a add operation made to a collection in a database. */
export class AddOperation<T extends Data> extends WriteOperation {
	readonly collection: string;
	readonly data: T;
	constructor(collection: string, data: T) {
		super();
		this.collection = collection;
		this.data = data;
	}
	async run(db: Database): Promise<SetOperation<T>> {
		const id = await db.query(this.collection).add(this.data);
		return new SetOperation<T>(this.collection, id, this.data); // When an add operation is run it returns a set operation so the operation is repeatable.
	}

	/** Set one of the props on this set operation to a different value. */
	with<K extends Key<T>>(key: Nullish<K>, value: T[K]): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, data: { ...this.data, [key]: value } };
	}
}

/** Create an add operation for a document. */
export const ADD = <T extends Data>({ collection }: DatabaseQuery<T>, data: T): AddOperation<T> => new AddOperation(collection, data);
