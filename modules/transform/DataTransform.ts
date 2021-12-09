import { Data, Prop, Key, transformData, Transformable } from "../util/index.js";
import { Transform } from "./Transform.js";

/**
 * Set of named transforms for the props of a data object.
 * - Named transforms probably correspond to the properties of an object.
 * - If a prop contains a new value, the prop is set to that new value.
 * - If a prop contains a transform, the existing value is transformed.
 * - This is a subset of `Dispatchers`
 */
export type DataTransforms<T extends Data> = { readonly [K in keyof T]?: T[K] | Transform<T[K]> };

/** Set of transforms that can be appled to an object's properties. */
export class DataTransform<T extends Data> extends Transform<T> implements Iterable<Prop<DataTransforms<T>>>, Transformable<T, T> {
	readonly props: DataTransforms<T>;
	constructor(transforms: DataTransforms<T> = {}) {
		super();
		this.props = transforms;
	}
	transform(existing: T): T {
		return transformData<T>(existing, this.props);
	}

	/**
	 * Return a new object with the specified additional transform.
	 * - If `key` is `undefined` nothing is changed (to make it easy to create conditional transforms).
	 */
	update<K extends Key<T>>(key: K | undefined | null | false, value: T[K] | Transform<T[K]>): this {
		if (key === undefined || key === null || key === false) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, props: { ...this.props, [key]: value } };
	}

	/** Iterate over the transforms in this object. */
	[Symbol.iterator](): Iterator<Prop<DataTransforms<T>>, void> {
		return Object.entries(this.props).values();
	}
}
