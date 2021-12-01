import { DataTransform, Transforms, Transform } from "../transform/index.js";
import { Hydrations, Datas, VOID, ImmutableArray, isAsync, MutableArray, Key } from "../util/index.js";
import type { Database, DatabaseDocument } from "./Database.js";

/** A single change that can be made to a database. */
export abstract class Change<T extends Datas> {
	/** Apply this change to a database. */
	abstract apply(db: Database<T>): void | PromiseLike<void>;
}

/** A change that writes a document in a database. */
export class Write<C extends Key<D>, D extends Datas> extends Change<D> {
	static on<Y extends Key<X>, X extends Datas>({ collection, id }: DatabaseDocument<Y, X>, value: X[Y] | Transform<X[Y]> | undefined): Write<Y, X> {
		return new Write(collection, id, value);
	}
	readonly collection: C;
	readonly id: string;
	readonly value: D[C] | Transform<D[C]> | undefined;
	constructor(collection: C, id: string, value: D[C] | Transform<D[C]> | undefined) {
		super();
		this.collection = collection;
		this.id = id;
		this.value = value;
	}
	apply(db: Database<D>) {
		return db.doc(this.collection, this.id).write(this.value);
	}
}

/**
 * Set of writes that can be applied to documents in a database.
 * - Sets of changes are predictable and repeatable, so unpredictable operations like `create()` and query operations are not supported.
 * - Every change must be applied to a specific database document in a specific collection.
 */
export class Writes<D extends Datas> extends Change<D> {
	static on<X extends Datas>(db: Database<X>, ...changes: ImmutableArray<Change<X>>): Writes<X> {
		return new Writes(...changes);
	}
	readonly changes: ImmutableArray<Change<D>>;
	constructor(...changes: ImmutableArray<Change<D>>) {
		super();
		this.changes = changes;
	}
	/** Return a new `Changes` instance with an additional `Write` instance in its changes list. */
	set<C extends Key<D>>({ collection, id }: DatabaseDocument<C, D>, data: D[C]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, changes: [...this.changes, new Write(collection, id, data)] };
	}
	/** Return a new `Changes` instance with an additional `Write` instance in its changes list. */
	delete<C extends Key<D>>({ collection, id }: DatabaseDocument<C, D>): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, changes: [...this.changes, new Write(collection, id, undefined)] };
	}
	/** Return a new `Changes` instance with an additional `Write` instance in its changes list. */
	update<C extends Key<D>>({ collection, id }: DatabaseDocument<C, D>, transforms: Transforms<D[C]> | Transform<D[C]>): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			changes: [...this.changes, new Write(collection, id, transforms instanceof Transform ? transforms : new DataTransform(transforms))],
		};
	}
	apply(db: Database<D>) {
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
