import { Hydrations } from "../util/hydration.js";
import type { Datas, ImmutableArray, MutableArray, Transforms } from "../util/index.js";
import type { Database } from "./Database.js";

/** A single change that can be made to a database. */
export abstract class Change<T extends Datas> {
	/** Apply this change to a database. */
	abstract apply(db: Database<T>): void | Promise<void>;
}

/** A change that sets the entire data of a document in a database. */
export class SetChange<T extends Datas, K extends keyof T & string> extends Change<T> {
	readonly collection: K;
	readonly id: string;
	readonly data: T[K];
	constructor(collection: K, id: string, data: T[K]) {
		super();
		this.collection = collection;
		this.id = id;
		this.data = data;
	}
	apply(db: Database<T>) {
		// Use an update query (rather than `document.update()` so there's no error thrown if the document doesn't exist).
		return db.docs(this.collection).is("id", this.id).set(this.data);
	}
}

/** A change that updates the value of a document in a database. */
export class UpdateChange<T extends Datas, K extends keyof T & string> extends Change<T> {
	readonly collection: K;
	readonly id: string;
	readonly transforms: Transforms<T[K]>;
	constructor(collection: K, id: string, transforms: Transforms<T[K]>) {
		super();
		this.collection = collection;
		this.id = id;
		this.transforms = transforms;
	}
	apply(db: Database<T>) {
		return db.doc(this.collection, this.id).update(this.transforms);
	}
}

/** A change that deletes a document from a database. */
export class DeleteChange<T extends Datas, K extends keyof T & string> extends Change<T> {
	readonly collection: K;
	readonly id: string;
	constructor(collection: K, id: string) {
		super();
		this.collection = collection;
		this.id = id;
	}
	apply(db: Database<T>) {
		return db.doc(this.collection, this.id).delete();
	}
}

/**
 * Set of changes that can be applied to documents in a database.
 * - Sets of changes are predictable and repeatable, so unpredictable operations like `create()` and query operations are not supported.
 * - Every change must be applied to a specific database document in a specific collection.
 */
export class Changes<T extends Datas> extends Change<T> {
	readonly changes: ImmutableArray<Change<T>>;
	constructor(...changes: ImmutableArray<Change<T>>) {
		super();
		this.changes = changes;
	}
	/** Return a new `Changes` instance with an additional `SetChange` instance in its changes list. */
	set<K extends keyof T & string>(collection: K, id: string, data: T[K]): this {
		return { __proto__: Changes.prototype, ...this, changes: [...this.changes, new SetChange(collection, id, data)] };
	}
	/** Return a new `Changes` instance with an additional `UpdateChange` instance in its changes list. */
	update<K extends keyof T & string>(collection: K, id: string, transforms: Transforms<T[K]>): this {
		return { __proto__: Changes.prototype, ...this, changes: [...this.changes, new UpdateChange(collection, id, transforms)] };
	}
	/** Return a new `Changes` instance with an additional `DeleteChange` instance in its changes list. */
	delete<K extends keyof T & string>(collection: K, id: string): this {
		return { __proto__: Changes.prototype, ...this, changes: [...this.changes, new DeleteChange(collection, id)] };
	}
	async apply(db: Database<T>) {
		const changes: MutableArray<unknown | Promise<unknown>> = [];
		for (const change of this.changes) changes.push(change.apply(db));
		await Promise.all(changes);
	}
}

/** Set of hydrations for all change classes. */
export const CHANGE_HYDRATIONS = {
	changes: Changes,
	set: SetChange,
	update: UpdateChange,
	delete: DeleteChange,
};
CHANGE_HYDRATIONS as Hydrations;
