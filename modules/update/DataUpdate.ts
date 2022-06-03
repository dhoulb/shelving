import type { Data, Key, Prop } from "../util/data.js";
import { isNullish, Nullish } from "../util/null.js";
import { Transformable, transformData } from "../util/transform.js";
import { Update } from "./Update.js";

/**
 * Set of named transforms for the props of a data object.
 * - Named transforms probably correspond to the properties of an object.
 * - If a prop contains a new value, the prop is set to that new value.
 * - If a prop contains a transform, the existing value is transformed.
 * - This is a subset of `Dispatchers`
 */
export type PropUpdates<T extends Data> = { readonly [K in keyof T]?: T[K] | Update<T[K]> };

/** Update that can be applied to a data object to update its props. */
export class DataUpdate<T extends Data> extends Update<T> implements Iterable<Prop<PropUpdates<T>>>, Transformable<T, T> {
	/** Return a data update with a specific prop marked for update. */
	static with<X extends Data, K extends Key<X>>(key: Nullish<K>, value: X[K] | Update<X[K]>): DataUpdate<X> {
		return new DataUpdate<X>(!isNullish(key) ? ({ [key]: value } as PropUpdates<X>) : {});
	}

	readonly updates: PropUpdates<T>;
	constructor(props: PropUpdates<T>) {
		super();
		this.updates = props;
	}

	/** Transform a a data object using this update. */
	transform(data: T): T {
		return transformData<T>(data, this.updates);
	}

	/** Return a data update with a specific prop marked for update. */
	with<K extends Key<T>>(key: Nullish<K>, value: T[K] | Update<T[K]>): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, updates: { ...this.updates, [key]: value } };
	}

	/** Iterate over the transforms in this object. */
	[Symbol.iterator](): Iterator<Prop<PropUpdates<T>>, void> {
		return Object.entries(this.updates).values();
	}
}
