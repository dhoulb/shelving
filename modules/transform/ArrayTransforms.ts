import { ImmutableArray, isArray, withItems, withoutItems } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Transform that can be applied to the entries of an array. */
export class ArrayTransforms<T> extends Transform<ImmutableArray<T>> {
	readonly adds: ImmutableArray<T>;
	readonly deletes: ImmutableArray<T>;
	constructor(adds: ImmutableArray<T> = [], deletes: ImmutableArray<T> = []) {
		super();
		this.adds = adds;
		this.deletes = deletes;
	}
	transform(existing: unknown): ImmutableArray<T> {
		const existingArray = isArray<ImmutableArray<T>>(existing) ? existing : [];
		return withoutItems(withItems(existingArray, this.adds), this.deletes);
	}

	/**
	 * Return a new object with the specified additional item.
	 * - If `key` is `undefined` or `null` nothing is changed (to make it easy to create conditional transforms).
	 * - Adds are applied before deletes.
	 */
	add(key: string | undefined | null, value: T | Transform<T>): this {
		if (key === undefined || key === null) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, sets: { ...this.adds, [key]: value } };
	}

	/**
	 * Return a new object with the specified additional delete transform on an entry.
	 * - If `key` is `undefined` or `null` nothing is changed (to make it easy to create conditional transforms).
	 * - Deletes are applied after adds.
	 */
	delete(key: string | undefined | null): this {
		if (key === undefined || key === null) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, deletes: [...this.deletes, key] };
	}
}
