import { isFunction } from "./function.js";
import { Data, Value, Prop, toProps, isData } from "./data.js";

/** Object that transforms an input value into an output value with its `transform()` method. */
export interface Transformable<I, O> {
	transform(input: I): O;
}

/** Any applier (useful for `extends AnyTransformr` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransformable = Transformable<any, any>;

/** Is an unknown value a derivable. */
export const isTransformable = <T extends AnyTransformable>(v: T | unknown): v is T => isData(v) && typeof v.transform === "function";

/** Function that transforms an input value into an output value by calling it, object that transforms an input value into an output value with its `transform()` method, or an output value that doesn't need to be transformed. */
export type Transformer<I, O> = Transformable<I, O> | ((input: I) => O) | O;

/** Transform a value using a transformer. */
export function transform<I, O>(input: I, transformer: (v: I) => O): O; // Helps `O` carry through functions that use generics.
export function transform<I, O>(input: I, transformer: Transformer<I, O>): O; // No promise returned with synchronous transformer.
export function transform<I, O>(input: I, transformer: Transformer<I, O>): O {
	return isFunction(transformer) ? transformer(input) : isTransformable(transformer) ? transformer.transform(input) : transformer;
}

/** Set of named transformers for a data object. */
export type PropTransformers<T extends Data> = { readonly [K in keyof T]?: Transformer<T[K], T[K]> };

/**
 * Transform the props of a data object using a set of transformers for its props.
 * @returns New object with changed props (or the same object if no changes were made).
 */
export function transformData<T extends Data>(data: T, transformers: PropTransformers<T>): T {
	return { ...data, ...Object.fromEntries(transformProps(data, transformers)) };
}

/**
 * Transform the props of a data object using a set of prop transformers.
 * @yield Transformed prop entry after calling the corresponding prop transformer.
 */
export function* transformProps<T extends Data>(data: T, transformers: PropTransformers<T>): Iterable<Prop<T>> {
	for (const [k, v] of toProps<{ readonly [K in keyof T]: Transformer<T[K], T[K]> }>(transformers)) yield [k, transform<Value<T>, Value<T>>(data[k], v)];
}
