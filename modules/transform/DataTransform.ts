import { Data, Prop, Key, deriveData } from "../util/index.js";
import { Transform } from "./Transform.js";

/**
 * Set of named transforms for the props of a data object.
 * - Named transforms probably correspond to the properties of an object.
 * - If a prop contains a new value, the prop is set to that new value.
 * - If a prop contains a transform, the existing value is transformed.
 * - This is a subset of `Dispatchers`
 */
export type Transforms<T extends Data> = { readonly [K in keyof T]?: T[K] | Transform<T[K]> };

/** Set of transforms that can be appled to an object's properties. */
export class DataTransform<T extends Data> extends Transform<T> implements Iterable<Prop<Transforms<T>>> {
	readonly transforms: Transforms<T>;
	constructor(transforms: Transforms<T>) {
		super();
		this.transforms = transforms;
	}
	derive(existing: T): T {
		return deriveData<T>(existing, this.transforms);
	}

	/** Return a new object with the specified additional transform. */
	prop<K extends Key<T>>(key: K, transform: T[K] | Transform<T[K]>): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, transforms: { ...this.transforms, [key]: transform } };
	}

	/** Return a new object with the specified additional transforms. */
	props(transforms: Transforms<T>): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, transforms: { ...this.transforms, ...transforms } };
	}

	/** Iterate over the transforms in this object. */
	[Symbol.iterator](): Iterator<Prop<Transforms<T>>, void> {
		return Object.entries(this.transforms).values();
	}
}
