import type { Entry } from "./entry.js";
import type { ArrayType, ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import { ImmutableObject } from "./object.js";
import { isFunction } from "./function.js";
import { Data, Value, Prop, toProps, isData } from "./data.js";
import { WatchIterator } from "./iterate.js";

/** Object that can be applied to an input to generate an output with its `apply()` method. */
export interface Transformable<I, O> {
	transform(input: I): O;
}

/** Any applier (useful for `extends AnyTransformr` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransformable = Transformable<any, any>;

/** Function that takes an input value and returns a value transformed from it, or an applier with matching arguments. */
export type Transformer<I, O> = Transformable<I, O> | ((input: I) => O) | O;

/** Any transformer (useful for `extends AnyTransformr` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransformer = Transformer<any, any>;

/** Extract the transformed type from a transformer. */
export type TransformedType<T extends AnyTransformer> = T extends Transformer<unknown, infer TT> ? TT : never;

/** Is an unknown value a transformer. */
export const isTransformer = <T extends AnyTransformer>(v: T | unknown): v is T => typeof v === "function" || isTransformable(v);

/** Is an unknown value a derivable. */
export const isTransformable = <T extends AnyTransformable>(v: T | unknown): v is T => isData(v) && typeof v.transform === "function";

/** Transform a value using a transformer. */
export function transform<I, O>(input: I, transformer: (v: I) => O): O; // Helps `O` carry through functions that use generics.
export function transform<I, O>(input: I, transformer: Transformer<I, O>): O; // No promise returned with synchronous transformer.
export function transform<I, O>(input: I, transformer: Transformer<I, O>): O {
	return isFunction(transformer) ? transformer(input) : isTransformable(transformer) ? transformer.transform(input) : transformer;
}

/**
 * Apply a transformer to each item in a set of items and yield the transformed item.
 *
 * @yield Transformed items after calling `transformer()` on each.
 * @returns Number of items that changed.
 */
export function transformItems<I, O>(items: Iterable<I>, transformer: (input: I) => O): Iterable<O>; // Helps `O` carry through functions that use generics.
export function transformItems<I, O>(items: Iterable<I>, transformer: Transformer<I, O>): Iterable<O>;
export function* transformItems<I, O>(items: Iterable<I>, transformer: Transformer<I, O>): Iterable<O> {
	for (const item of items) yield transform(item, transformer);
}

/**
 * Apply a transformer to each item in an array and return the transformed array.
 *
 * @param arr The input array or map-like object or iterable to iterate over.
 * @param mapper Mapping function that receives the value and key and returns the corresponding value.
 * - Mapper can return a promise. If it does will return a Promise that resolves once every value has resolved.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Mapper can be a non-function static value and all the values will be set to that value.
 *
 * @return The mapped array.
 * - Immutable so if the values don't change then the same instance will be returned.
 */
export function transformArray<T extends ImmutableArray>(arr: T, transformer: Transformer<ArrayType<T>, ArrayType<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function transformArray<I, O>(arr: Iterable<I>, transformer: (v: I) => O): ImmutableArray<O>; // Helps `O` carry through functions that use generics.
export function transformArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O>;
export function transformArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O> {
	return Array.from(transformItems(arr, transformer));
}

/**
 * Transform the _values_ of a set of entries using a transformer.
 * @yield Transformed entry after calling transforming the new value for each entry.
 */
export function transformValues<I, O>(entries: Iterable<Entry<I>>, transformer: (v: I) => O): Iterable<Entry<O>>; // Helps `O` carry through functions that use generics.
export function transformValues<I, O>(entries: Iterable<Entry<I>>, transformer: Transformer<I, O>): Iterable<Entry<O>>;
export function* transformValues<I, O>(entries: Iterable<Entry<I>>, transformer: Transformer<I, O>): Iterable<Entry<O>> {
	for (const [k, v] of entries) yield [k, transform(v, transformer)];
}

/**
 * Transform the _values_ of a map using a transformer.
 * @return New map after transforming its values.
 */
export function transformMap<I, O>(map: ImmutableMap<I>, transformer: (v: I) => O): ImmutableMap<O>; // Helps `O` carry through functions that use generics.
export function transformMap<I, O>(map: ImmutableMap<I>, transformer: Transformer<I, O>): ImmutableMap<O>;
export function transformMap<I, O>(map: ImmutableMap<I>, transformer: Transformer<I, O>): ImmutableMap<O> {
	return new Map(transformValues(map, transformer));
}

/**
 * Transform the _values_ of an object using a transformer.
 * @return New object after transforming its entries.
 */
export function transformObject<T extends Data>(obj: T, transformer: Transformer<Value<T>, Value<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function transformObject<I extends Data, O extends { [K in keyof I]: unknown }>(obj: I, transformer: Transformer<Value<I>, Value<O>>): O; // Transform an entire object with the same props with different types.
export function transformObject<I, O>(obj: ImmutableObject<I>, transformer: (v: I) => O): ImmutableObject<O>; // Helps `O` carry through functions that use generics.
export function transformObject<I, O>(obj: ImmutableObject<I>, transformer: Transformer<I, O>): ImmutableObject<O>;
export function transformObject<I, O>(obj: ImmutableObject<I>, transformer: Transformer<I, O>): ImmutableObject<O> {
	return Object.fromEntries(transformValues(Object.entries(obj), transformer));
}

/** Set of named transformers for a data object. */
export type Transformers<T extends Data> = { readonly [K in keyof T]?: Transformer<T[K], T[K]> };

/** Complete set of named transformers for a data object (i.e. every prop has a transformer specified). */
export type RequiredTransformers<T extends Data> = { readonly [K in keyof T]: Transformer<T[K], T[K]> };

/**
 * Transform the props of a data object using a set of transforms.
 * @yields Valid new prop entries for the data object (only changed values are yielded).
 */
export function* transformProps<T extends Data>(existing: T, transformers: Transformers<T>): Generator<Prop<T>, void> {
	for (const [k, v] of toProps<RequiredTransformers<T>>(transformers)) {
		const current = existing[k];
		const transformed = transform<Value<T>, Value<T>>(current, v);
		if (transformed !== current) yield [k, transformed];
	}
}

/**
 * Transform a new data object using a set of transformers for its props.
 * @returns New object with changed props (or the same object if no changes were made).
 */
export function transformData<T extends Data>(existing: T, transformers: Transformers<T>): T {
	const watcher = new WatchIterator(transformProps(existing, transformers));
	const transformed = Object.fromEntries(watcher);
	return watcher.count ? { ...existing, ...transformed } : existing;
}
