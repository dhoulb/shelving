import { DataTransform, Transforms, Transform } from "../transform/index.js";
import { Hydrations, VOID, ImmutableArray, isAsync, MutableArray, Data } from "../util/index.js";
import type { Database, DataDocument } from "./Database.js";

/** A single change that can be made to a database. */
export abstract class Change {
	/** Apply this change to a database. */
	abstract apply(db: Database): void | PromiseLike<void>;
}

/** A change that writes a document in a database. */
export class Write<T extends Data> extends Change {
	readonly collection: string;
	readonly id: string;
	readonly value: Data | Transform<Data> | undefined;
	constructor({ collection, id }: DataDocument<T>, value: T | Transform<T> | undefined) {
		super();
		this.collection = collection;
		this.id = id;
		this.value = value;
	}
	apply(db: Database) {
		return db.doc(this.collection, this.id).write(this.value);
	}
}

/**
 * Set of writes that can be applied to documents in a database.
 * - Sets of changes are predictable and repeatable, so unpredictable operations like `create()` and query operations are not supported.
 * - Every change must be applied to a specific database document in a specific collection.
 */
export class Writes extends Change {
	readonly changes: ImmutableArray<Change>;
	constructor(...changes: Change[]) {
		super();
		this.changes = changes;
	}
	/** Return a new `Changes` instance with an additional `Write` instance in its changes list. */
	set<T extends Data>(ref: DataDocument<T>, data: T): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, changes: [...this.changes, new Write(ref, data)] };
	}
	/** Return a new `Changes` instance with an additional `Write` instance in its changes list. */
	delete<T extends Data>(ref: DataDocument<T>): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, changes: [...this.changes, new Write(ref, undefined)] };
	}
	/** Return a new `Changes` instance with an additional `Write` instance in its changes list. */
	update<T extends Data>(ref: DataDocument<T>, transforms: Transforms<T> | Transform<T>): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			changes: [...this.changes, new Write(ref, transforms instanceof Transform ? transforms : new DataTransform(transforms))],
		};
	}
	apply(db: Database) {
		const promises: MutableArray<PromiseLike<void>> = [];
		for (const change of this.changes) {
			const applied = change.apply(db);
			if (isAsync(applied)) promises.push(applied);
		}
		if (promises.length) return Promise.all(promises).then(VOID);
	}
}

/** Set of hydrations for all change classes. */
export const CHANGE_HYDRATIONS = {
	writes: Writes,
	write: Write,
};
CHANGE_HYDRATIONS as Hydrations;
