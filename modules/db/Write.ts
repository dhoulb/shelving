import { Transform } from "../transform/index.js";
import { Hydrations, ImmutableArray, Data, Transformable, transform } from "../util/index.js";
import type { Database, DataDocument } from "./Database.js";

/** Write to a database. */
export abstract class Write implements Transformable<Database, void | PromiseLike<void>> {
	abstract transform(db: Database): void | PromiseLike<void>;
}

/** Represent a write made to a single document in a database. */
export class DocumentWrite<T extends Data> extends Write {
	readonly collection: string;
	readonly id: string;
	readonly value: Data | Transform<Data> | undefined;
	constructor({ collection, id }: DataDocument<T>, value: T | Transform<T> | undefined) {
		super();
		this.collection = collection;
		this.id = id;
		this.value = value;
	}
	async transform(db: Database) {
		await db.doc(this.collection, this.id).write(this.value);
	}
}

/**
 * Represent a list of writes made to a database.
 * - Sets of writes are predictable and repeatable, so unpredictable operations like `create()` and query operations are not supported.
 * - Every write must be applied to a specific database document in a specific collection and are applied in the specified order.
 */
export class Writes extends Write {
	readonly writes: ImmutableArray<Write>;
	constructor(...writes: Write[]) {
		super();
		this.writes = writes;
	}
	async transform(db: Database) {
		for (const writes of this.writes) await transform(db, writes);
	}
}

/** Set of hydrations for all change classes. */
export const WRITE_HYDRATIONS = {
	writes: Writes,
	write: DocumentWrite,
};
WRITE_HYDRATIONS as Hydrations;
