import { Data, Prop, Key, transformProps, Transformable } from "../util/index.js";
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
	readonly props: PropUpdates<T>;
	constructor(props: PropUpdates<T>) {
		super();
		this.props = props;
	}
	transform(existing: T): T {
		return transformProps<T>(existing, this.props);
	}

	/** Return a new object with the specified additional transform for a prop. */
	prop<K extends Key<T>>(key: K | undefined | null | false, value: T[K] | Update<T[K]>): this {
		if (key === undefined || key === null || key === false) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, props: { ...this.props, [key]: value } };
	}

	/** Iterate over the transforms in this object. */
	[Symbol.iterator](): Iterator<Prop<PropUpdates<T>>, void> {
		return Object.entries(this.props).values();
	}
}
