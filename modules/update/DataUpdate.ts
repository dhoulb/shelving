import { Data, DataKey, DataProp } from "../util/data.js";
import { isNullish, Nullish } from "../util/null.js";
import { cloneObjectWith } from "../util/object.js";
import { Transformable, transformObject } from "../util/transform.js";
import { Update } from "./Update.js";

/**
 * Set of named updates for the props of a data object.
 * - Similar to `Transformers` but only allows `Update` instances.
 * - If a prop contains a new value, the prop is set to that new value.
 * - If a prop contains an `Update` instance, the existing value is updated.
 */
export type Updates<T extends Data = Data> = { readonly [K in keyof T]?: T[K] | Update<T[K]> | undefined };

/**
 * Update that can be applied to a data object to update its props.
 */
export class DataUpdate<T extends Data = Data> extends Update<T> implements Iterable<DataProp<Updates<T>>>, Transformable<T, T> {
	/** Return a data update with multiple props updated. */
	static update<X extends Data>(updates: Updates<X>): DataUpdate<X> {
		return new DataUpdate<X>(updates);
	}

	/** Return a data update with a specific prop set. */
	static setProp<X extends Data, K extends DataKey<X>>(key: Nullish<K>, value: X[K]): DataUpdate<X> {
		return DataUpdate.updateProp(key, value);
	}

	/** Return a data update with a specific prop updated. */
	static updateProp<X extends Data, K extends DataKey<X>>(key: Nullish<K>, value: X[K] | Update<X[K]>): DataUpdate<X> {
		return new DataUpdate<X>(!isNullish(key) ? ({ [key]: value } as Updates<X>) : {});
	}

	readonly updates: Updates<T>;
	constructor(props: Updates<T>) {
		super();
		this.updates = props;
	}

	/** Return a data update with multiple props updated. */
	update(updates: Updates<T>): this {
		return cloneObjectWith(this, "updates", { ...this.updates, ...updates });
	}

	/** Return a data update with a specific prop set. */
	setProp<K extends DataKey<T>>(key: Nullish<K>, value: T[K]): this {
		return this.updateProp(key, value);
	}

	/** Return a data update with a specific prop updated. */
	updateProp<K extends DataKey<T>>(key: Nullish<K>, value: T[K] | Update<T[K]>): this {
		return isNullish(key) ? this : cloneObjectWith(this, "updates", { ...this.updates, [key]: value });
	}

	// Implement `Transformable`
	transform(data: T): T;
	transform(data?: T | Partial<T>): Partial<T>;
	transform(data: T | Partial<T> = {}): Partial<T> {
		return transformObject(data, this.updates);
	}

	// Implement `Iterable`
	[Symbol.iterator](): Iterator<DataProp<{ readonly [K in keyof T]: T[K] | Update<T[K]> }>, void> {
		return Object.entries(this.updates).values();
	}
}
