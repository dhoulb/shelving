import { Hydrations } from "../util/hydration.js";
import { Datas, getVoid, ImmutableArray, isAsync, MutableArray, Transforms } from "../util/index.js";
import type { Database } from "./Database.js";

/** A single change that can be made to a database. */
export abstract class Change<D extends Datas> {
	/** Apply this change to a database. */
	abstract apply(db: Database<D>): void | Promise<void>;
}

/** A change that sets a document in a database. */
export class SetChange<D extends Datas, C extends keyof D & string> extends Change<D> {
	readonly collection: C;
	readonly id: string;
	readonly result: D[C];
	constructor(collection: C, id: string, result: D[C]) {
		super();
		this.collection = collection;
		this.id = id;
		this.result = result;
	}
	apply(db: Database<D>) {
		return db.doc(this.collection, this.id).set(this.result);
	}
}

/** A change that updates the data of a document in a database, if it exists. */
export class UpdateChange<D extends Datas, C extends keyof D & string> extends Change<D> {
	readonly collection: C;
	readonly id: string;
	readonly transforms: Transforms<D[C]>;
	constructor(collection: C, id: string, transforms: Transforms<D[C]>) {
		super();
		this.collection = collection;
		this.id = id;
		this.transforms = transforms;
	}
	apply(db: Database<D>) {
		// Update is applied using a query so if the document doesn't exist it won't error.
		return db.query(this.collection).is("id", this.id).update(this.transforms);
	}
}

/** A change that deletes a document in a database, if it exists. */
export class DeleteChange<D extends Datas, C extends keyof D & string> extends Change<D> {
	readonly collection: C;
	readonly id: string;
	constructor(collection: C, id: string) {
		super();
		this.collection = collection;
		this.id = id;
	}
	apply(db: Database<D>) {
		return db.doc(this.collection, this.id).delete();
	}
}

/**
 * Set of changes that can be applied to documents in a database.
 * - Sets of changes are predictable and repeatable, so unpredictable operations like `create()` and query operations are not supported.
 * - Every change must be applied to a specific database document in a specific collection.
 */
export class Changes<D extends Datas> extends Change<D> {
	static on<X extends Datas>(db: Database<X>, ...changes: ImmutableArray<Change<X>>): Changes<X> {
		return new Changes(...changes);
	}
	readonly changes: ImmutableArray<Change<D>>;
	constructor(...changes: ImmutableArray<Change<D>>) {
		super();
		this.changes = changes;
	}
	/** Return a new `Changes` instance with an additional `Write` instance in its changes list. */
	set<K extends keyof D & string>(collection: K, id: string, result: D[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, changes: [...this.changes, new SetChange(collection, id, result)] };
	}
	/** Return a new `Changes` instance with an additional `Write` instance in its changes list. */
	delete<K extends keyof D & string>(collection: K, id: string): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, changes: [...this.changes, new DeleteChange(collection, id)] };
	}
	/** Return a new `Changes` instance with an additional `Update` instance in its changes list. */
	update<K extends keyof D & string>(collection: K, id: string, transforms: Transforms<D[K]>): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, changes: [...this.changes, new UpdateChange(collection, id, transforms)] };
	}
	apply(db: Database<D>) {
		const promises: MutableArray<Promise<void>> = [];
		for (const change of this.changes) {
			const applied = change.apply(db);
			if (isAsync(applied)) promises.push(applied);
		}
		if (promises.length) return Promise.all(promises).then(getVoid);
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
