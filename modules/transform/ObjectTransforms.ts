import { Entry, ImmutableArray, ImmutableObject, isObject, transformEntries } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Transform that can be applied to the entries of a map-like object. */
export class ObjectTransforms<T> extends Transform<ImmutableObject<T>> implements Iterable<Entry<T | Transform<T> | undefined>> {
	readonly updates: ImmutableObject<T | Transform<T>>;
	readonly deletes: ImmutableArray<string>;
	constructor(updates: ImmutableObject<T | Transform<T>> = {}, deletes: ImmutableArray<string> = []) {
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
	update(key: string | undefined | null, value: T | Transform<T>): this {
		if (key === undefined || key === null) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, sets: { ...this.updates, [key]: value } };
	}

	/**
	 * Return a new object with the specified additional delete transform on an entry.
	 * - If `key` is `undefined` or `null` nothing is changed (to make it easy to create conditional transforms).
	 * - Deletes are applied after updates.
	 */
	delete(key: string | undefined | null): this {
		if (key === undefined || key === null) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, deletes: [...this.deletes, key] };
	}

	/** Iterate over the changes in this object (updates first, then deletes). */
	*[Symbol.iterator](): Iterator<Entry<T | Transform<T> | undefined>, void> {
		for (const entry of Object.entries(this.updates)) yield entry;
		for (const key of this.deletes) yield [key, undefined];
	}
}
