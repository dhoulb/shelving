import type { Hydrations } from "./hydration.js";
import { withItems, ImmutableArray, isArray, withoutItems } from "./array.js";
import { ImmutableObject, isObject, withoutEntries, withProps } from "./object.js";

/** Transform: an object, possibly with a configuration, that transforms an existing value value into a new value. */
export abstract class Transform<T = unknown> {
	/** Apply this transform to a value. */
	abstract transform(existing?: unknown): T;
}

/**
 * Increment transform: an object that increments/decrements a value.
 * - Hint: you can use negative numbers to decrement the number too!
 */
export class IncrementTransform extends Transform<number> {
	static INCREMENT_ONE = new IncrementTransform(1);
	static DECREMENT_ONE = new IncrementTransform(-1);
	readonly amount: number;
	constructor(amount: number) {
		super();
		this.amount = amount;
	}
	transform(existing?: unknown): number {
		return typeof existing === "number" ? existing + this.amount : this.amount;
	}
}

/** Add array item transform: an object that adds a specific item to an array. */
export class AddItemsTransform<T> extends Transform<ImmutableArray<T>> {
	readonly items: ImmutableArray<T>;
	constructor(...items: ImmutableArray<T>) {
		super();
		this.items = items;
	}
	transform(existing?: unknown): ImmutableArray<T> {
		return isArray<ImmutableArray<T>>(existing) ? withItems(existing, this.items) : this.items;
	}
}

/** Remove array item transform: an object that removes a specific item from an array. */
export class RemoveItemsTransform<T> extends Transform<ImmutableArray<T>> {
	readonly items: ImmutableArray<T>;
	constructor(...items: ImmutableArray<T>) {
		super();
		this.items = items;
	}
	transform(existing?: unknown): ImmutableArray<T> {
		return isArray<ImmutableArray<T>>(existing) ? withoutItems(existing, this.items) : this.items;
	}
}

/** Add entries transform: an object that adds a set of naemd props to a map-like object. */
export class AddEntriesTransform<T> extends Transform<ImmutableObject<T>> {
	readonly props: ImmutableObject<T>;
	constructor(props: ImmutableObject<T>) {
		super();
		this.props = props;
	}
	transform(existing?: unknown): ImmutableObject<T> {
		return isObject<ImmutableObject<T>>(existing) ? withProps(existing, this.props) : {};
	}
}

/** Remove props transform: an object that removes a specific set of named props from a map-like object. */
export class RemoveEntriesTransform<T> extends Transform<ImmutableObject<T>> {
	readonly props: ImmutableArray<string>;
	constructor(...props: ImmutableArray<string>) {
		super();
		this.props = props;
	}
	transform(existing?: unknown): ImmutableObject<T> {
		return isObject<ImmutableObject<T>>(existing) ? withoutEntries(existing, this.props) : {};
	}
}

/**
 * Transform a value by applying a new value or a `Transform` object.
 *
 * @param existing The existing value to transform.
 *
 * @param next The next value or a `Transform` instance to apply to the existing value.
 * - If next is a new value, it is set.
 * - If next is a `Transform` instance, the existing value is transformed.
 * - If next is literal `undefined` it is ignored.
 *
 * @returns The transformed value.
 */
export function transform<T>(existing: T, next: T | Transform<T>): T {
	return next instanceof Transform ? next.transform(existing) : next;
}

/**
 * Return a new object with transformed props.
 * - A set of transforms is an object whose props are either a new value for that prop or a `Transform` instance to apply to that prop.
 *
 * @param existing The original object that needs to be transformed.
 *
 * @param transforms An object containing new values or `Transform` instances to apply to the existing props of `obj`
 * - If a prop contains a new value, the prop is set to that new value.
 * - If a prop contains a `Transform` instance, the existing value is transformed.
 * - If a prop contains literal `undefined` it is ignored.
 *
 * @return New object after applying the new values and `Transform` instances to it.
 * - If no changes are made by the transform the exact same instance of `obj` is returned.
 */
export function transformProps<O extends ImmutableObject>(existing: O, transforms: Transforms<O>): O {
	let changed = false;
	const next: O = { ...existing };
	for (const [k, v] of Object.entries(transforms) as [keyof O, O[keyof O] | Transform<O[keyof O]> | undefined][])
		if (v !== undefined) {
			const n = (next[k] = v instanceof Transform ? v.transform(existing[k]) : v);
			if (existing[k] !== n) changed = true;
		}
	return changed ? next : existing;
}

/**
 * Set of transforms for an object: an object containing partial new values or `Transform` instances to apply to that prop.
 * - If a prop contains a new value, the prop is set to that new value.
 * - If a prop contains a `Transform` instance, the existing value is transformed.
 * - If a prop contains literal `undefined` it is ignored.
 */
export type Transforms<O extends ImmutableObject> = { readonly [K in keyof O]?: O[K] | Transform<O[K]> | undefined };

/** Set of hydrations for all transform classes. */
export const TRANSFORM_HYDRATIONS = {
	increment: IncrementTransform,
	addItems: AddItemsTransform,
	removeItems: RemoveItemsTransform,
	addEntries: AddEntriesTransform,
	removeEntries: RemoveEntriesTransform,
};
TRANSFORM_HYDRATIONS as Hydrations;
