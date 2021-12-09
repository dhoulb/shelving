import { DataUpdate, PropUpdates, Update } from "../update/index.js";
import { Hydrations, ImmutableArray, Data, Transformable, transform, IS_DEFINED } from "../util/index.js";
import type { Database, DataDocument } from "./Database.js";

/** Represent a write made to a database. */
export abstract class Write implements Transformable<Database, void | PromiseLike<void>> {
	abstract transform(db: Database): void | PromiseLike<void>;
}

/**
 * Represent a list of writes made to a database.
 * - Sets of writes are predictable and repeatable, so unpredictable operations like `create()` and query operations are not supported.
 * - Every write must be applied to a specific database document in a specific collection and are applied in the specified order.
 */
export class Writes extends Write {
	readonly writes: ImmutableArray<Write>;
	constructor(...writes: (Write | undefined)[]) {
		super();
		this.writes = writes.filter(IS_DEFINED);
	}
	async transform(db: Database) {
		for (const writes of this.writes) await transform(db, writes);
	}
}

/** Represent a write made to a single document in a database. */
export abstract class DocumentWrite<T extends Data> extends Write {
	readonly collection: string;
	readonly id: string;
	constructor({ collection, id }: DataDocument<T>) {
		super();
		this.collection = collection;
		this.id = id;
	}
}

/** Represent a set operation made to a single document in a database. */
export class DocumentSet<T extends Data> extends DocumentWrite<T> {
	readonly data: T;
	constructor(ref: DataDocument<T>, data: T) {
		super(ref);
		this.data = data;
	}
	async transform(db: Database) {
		await db.doc(this.collection, this.id).set(this.data);
	}
}

/** Represent an update operation made to a single document in a database. */
export class DocumentUpdate<T extends Data> extends DocumentWrite<T> {
	readonly updates: Update<T>;
	constructor(ref: DataDocument<T>, updates: Update<T> | PropUpdates<T>) {
		super(ref);
		this.updates = updates instanceof Update ? updates : new DataUpdate(updates);
	}
	async transform(db: Database) {
		await db.doc(this.collection, this.id).update(this.updates);
	}
}

/** Represent a delete operation made to a single document in a database. */
export class DocumentDelete<T extends Data> extends DocumentWrite<T> {
	async transform(db: Database) {
		await db.doc(this.collection, this.id).delete();
	}
}

/** Set of hydrations for all change classes. */
export const WRITE_HYDRATIONS = {
	Writes,
	DocumentSet,
	DocumentUpdate,
	DocumentDelete,
};
WRITE_HYDRATIONS as Hydrations;
