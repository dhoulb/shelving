import { Entry, ImmutableArray, ImmutableObject, isObject, isNullish, transformEntries, Nullish } from "../util/index.js";
import { Update } from "./Update.js";

/** Set of named transforms for the entries of a map-like object. */
export type EntryUpdates<T> = ImmutableObject<T | Update<T>>;

/** Update that can be applied to a map-like object to add/remove/update its entries. */
export class ObjectUpdate<T> extends Update<ImmutableObject<T>> implements Iterable<Entry<T | Update<T> | undefined>> {
	/** Return an object update with a specific entry marked for update. */
	static update<X>(key: string | undefined | null, value: X | Update<X>): ObjectUpdate<X> {
		return new ObjectUpdate(isNullish(key) ? {} : { [key]: value });
	}

	/** Return an object update with a specific entry marked for deletion. */
	static delete<X>(key: string | undefined | null): ObjectUpdate<X> {
		return new ObjectUpdate({}, isNullish(key) ? [] : [key]);
	}

	readonly updates: EntryUpdates<T>;
	readonly deletes: ImmutableArray<string>;
	constructor(updates: EntryUpdates<T> = {}, deletes: ImmutableArray<string> = []) {
		super();
		this.updates = updates;
		this.deletes = deletes;
	}
	transform(existing: unknown): ImmutableObject<T> {
		const existingObject = isObject<ImmutableObject<T>>(existing) ? existing : {};
		return transformEntries<T>(existingObject, this.updates, this.deletes);
	}

	/** Return an object update with a specific entry marked for update. */
	update(key: Nullish<string>, value: T | Update<T>): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, sets: { ...this.updates, [key]: value } };
	}

	/** Return an object update with a specific entry marked for deletion. */
	delete(key: Nullish<string>): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, deletes: [...this.deletes, key] };
	}

	/**
	 * Iterate over the changes in this object.
	 * - Updates are yielded first, then deletes.
	 * - Entries whose value is `undefined` indicate deletion.
	 */
	*[Symbol.iterator](): Iterator<Entry<T | Update<T> | undefined>, void> {
		for (const entry of Object.entries(this.updates)) yield entry;
		for (const key of this.deletes) yield [key, undefined];
	}
}
