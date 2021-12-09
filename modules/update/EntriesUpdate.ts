import { Entry, ImmutableArray, ImmutableObject, isObject, transformEntries } from "../util/index.js";
import { Update } from "./Update.js";

/** Set of named transforms for the entries of a map-like object. */
export type EntryUpdates<T> = ImmutableObject<T | Update<T>>;

/** Update that can be applied to add/delete/update the entries of a map-like object. */
export class EntriesUpdate<T> extends Update<ImmutableObject<T>> implements Iterable<Entry<T | Update<T> | undefined>> {
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

	/**
	 * Return a new object with the specified additional transform on an entry.
	 * - If `key` is `undefined` or `null` nothing is changed (to make it easy to create conditional transforms).
	 * - Updates are applied before deletes.
	 */
	with(key: string | undefined | null, value: T | Update<T>): this {
		if (key === undefined || key === null) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, sets: { ...this.updates, [key]: value } };
	}

	/**
	 * Return a new object with the specified additional delete transform on an entry.
	 * - If `key` is `undefined` or `null` nothing is changed (to make it easy to create conditional transforms).
	 * - Deletes are applied after updates.
	 */
	without(key: string | undefined | null): this {
		if (key === undefined || key === null) return this;
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
