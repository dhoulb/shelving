import { getProps, ImmutableObject, isObject } from "./object.js";

/** Object that can transform a value using its `transform()` method. */
export interface Transformable<T> {
	transform(existing?: unknown): T;
}

/** Object that can transform a value using its `transform()` method, or a function that does the same. */
export type Transformer<T> = Transformable<T> | ((existing?: unknown) => T);

/** Any transformer (useful for `extends AnyTransformer` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransformer = Transformer<any>;

/** Is an unknown value a `Transformer` */
export const isTransformer = <T extends AnyTransformer>(v: T | unknown): v is T =>
	typeof v === "function" || (isObject(v) && typeof v.transform === "function");

/**
 * Set of named transforms.
 * - Named transforms probably correspond to the properties of an object.
 * - If a prop contains a new value, the prop is set to that new value.
 * - If a prop contains a `Transform` instance, the existing value is transformed.
 */
export type Transformers<T extends ImmutableObject> = { readonly [K in keyof T & string]?: T[K] | Transformer<T[K]> };

/**
 * Set of named transforms that can be modified and added to.
 * - Useful when _creating_ a set of transforms.
 */
export type MutableTransformers<T extends ImmutableObject> = { [K in keyof T & string]?: T[K] | Transformer<T[K]> };

/** Transform an unknown value with a `Transformer` */
export function transform<T>(existing: T, transformer: Transformer<T>): T {
	return typeof transformer === "function" ? transformer(existing) : transformer.transform(existing);
}

/** Transform an object with a set of `Transformers` */
export function transformProps<T extends ImmutableObject>(existing: T, transformers: Transformers<T>): T {
	let changed = false;
	const next: T = { ...existing };
	for (const [k, v] of getProps(transformers) as [keyof T & string, T[string] | Transformer<T[string]>][]) {
		const e = existing[k];
		const n = isTransformer(v) ? transform(e, v) : v;
		next[k] = n;
		if (e !== n) changed = true;
	}
	return changed ? next : existing;
}
