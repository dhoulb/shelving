import type { Entry } from "../util/entry.js";
import type { ImmutableArray } from "../util/array.js";
import { isNullish, Nullish } from "../util/null.js";
import { ImmutableObject } from "../util/object.js";
import { transform } from "../util/transform.js";
import { Update } from "./Update.js";

/** Set of named transforms for the entries of a map-like object. */
export type EntryUpdates<T> = ImmutableObject<T | Update<T>>;

/** Update that can be applied to a map-like object to add/remove/update its entries. */
export class ObjectUpdate<T> extends Update<ImmutableObject<T>> implements Iterable<Entry<T | Update<T> | undefined>> {
	/** Return an object update with a specific entry marked for update. */
	static with<X>(key: Nullish<string>, value: X | Update<X>): ObjectUpdate<X> {
		return new ObjectUpdate(isNullish(key) ? {} : { [key]: value });
	}

	/** Return an object update with a specific entry marked for deletion. */
	static without<X>(key: Nullish<string>): ObjectUpdate<X> {
		return new ObjectUpdate({}, isNullish(key) ? [] : [key]);
	}

	readonly updates: EntryUpdates<T>;
	readonly deletes: ImmutableArray<string>;
	constructor(updates: EntryUpdates<T> = {}, deletes: ImmutableArray<string> = []) {
		super();
		this.updates = updates;
		this.deletes = deletes;
	}

	/** Transform an object with this object transform. */
	transform(obj: ImmutableObject<T> = {}): ImmutableObject<T> {
		return Object.fromEntries(_getUpdatedEntries(obj, this.updates, this.deletes));
	}

	/** Return an object update with a specific entry marked for update. */
	with(key: Nullish<string>, value: T | Update<T>): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, sets: { ...this.updates, [key]: value } };
	}

	/** Return an object update with a specific entry marked for deletion. */
	without(key: Nullish<string>): this {
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

function* _getUpdatedEntries<T>(obj: ImmutableObject<T>, updates: EntryUpdates<T>, deletes: ImmutableArray<string>): Iterable<Entry<T>> {
	// Yield the entries from the original object (if they're not in deletes).
	for (const [k, v] of Object.entries(obj)) if (!deletes.includes(k)) yield [k, v];
	// Yield the transformed entries from the updates object (if they're not in deletes).
	for (const [k, v] of Object.entries(updates)) if (!deletes.includes(k)) yield [k, transform(obj[k], v)];
}
