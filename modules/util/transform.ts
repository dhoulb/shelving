import type { Entry } from "./entry.js";
import type { ArrayType, ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import { ImmutableObject } from "./object.js";
import { isFunction } from "./function.js";
import { Data, Value, Prop, toProps, isData } from "./data.js";
import { KEY_IN, yieldFiltered } from "./filter.js";
import { yieldMerged } from "./iterate.js";

/** Object that can be applied to an input to generate an output with its `apply()` method. */
export interface Transformable<I, O> {
	transform(input: I): O;
}

/** Any applier (useful for `extends AnyTransformr` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransformable = Transformable<any, any>;

/** Is an unknown value a derivable. */
export const isApplier = <T extends AnyTransformable>(v: T | unknown): v is T => isData(v) && typeof v.transform === "function";

/** Function that takes an input value and returns a value transformed from it, or an applier with matching arguments. */
export type Transformer<I, O> = Transformable<I, O> | ((input: I) => O) | O;

/** Any transformer (useful for `extends AnyTransformr` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransformer = Transformer<any, any>;

/** Extract the transformed type from a transformer. */
export type TransformedType<T extends AnyTransformer> = T extends Transformer<unknown, infer TT> ? TT : never;

/** Is an unknown value a transformer. */
export const isTransformer = <T extends AnyTransformer>(v: T | unknown): v is T => typeof v === "function" || isApplier(v);

/** Transform a value using a transformer. */
export function transform<I, O>(input: I, transformer: (v: I) => O): O; // Helps `O` carry through functions that use generics.
export function transform<I, O>(input: I, transformer: Transformer<I, O>): O; // No promise returned with synchronous transformer.
export function transform<I, O>(input: I, transformer: Transformer<I, O>): O {
	return isFunction(transformer) ? transformer(input) : isApplier(transformer) ? transformer.transform(input) : transformer;
}

/**
 * Apply a transformer to each item in a set of items and yield the transformed item.
 * @yield Transformed items after calling `transformer()` on each.
 */
export function yieldTransformed<I, O>(items: Iterable<I>, transformer: (input: I) => O): Iterable<O>; // Helps `O` carry through functions that use generics.
export function yieldTransformed<I, O>(items: Iterable<I>, transformer: Transformer<I, O>): Iterable<O>;
export function* yieldTransformed<I, O>(items: Iterable<I>, transformer: Transformer<I, O>): Iterable<O> {
	for (const item of items) yield transform(item, transformer);
}

/**
 * Apply a transformer to each item in an array and return the transformed array.
 * @return The transformed array.
 */
export function transformArray<T extends ImmutableArray>(arr: T, transformer: Transformer<ArrayType<T>, ArrayType<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function transformArray<I, O>(arr: Iterable<I>, transformer: (v: I) => O): ImmutableArray<O>; // Helps `O` carry through functions that use generics.
export function transformArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O>;
export function transformArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O> {
	return Array.from(yieldTransformed(arr, transformer));
}

/**
 * Transform the _values_ of a set of entries using a transformer.
 * @yield Transformed entry after calling transforming the new value for each entry.
 */
export function yieldTransformedValues<I, O>(entries: Iterable<Entry<I>>, transformer: (v: I) => O): Iterable<Entry<O>>; // Helps `O` carry through functions that use generics.
export function yieldTransformedValues<I, O>(entries: Iterable<Entry<I>>, transformer: Transformer<I, O>): Iterable<Entry<O>>;
export function* yieldTransformedValues<I, O>(entries: Iterable<Entry<I>>, transformer: Transformer<I, O>): Iterable<Entry<O>> {
	for (const [k, v] of entries) yield [k, transform(v, transformer)];
}

/**
 * Transform the _values_ of a map using a transformer.
 * @return New map after transforming its values.
 */
export function transformMap<I, O>(map: ImmutableMap<I>, transformer: (v: I) => O): ImmutableMap<O>; // Helps `O` carry through functions that use generics.
export function transformMap<I, O>(map: ImmutableMap<I>, transformer: Transformer<I, O>): ImmutableMap<O>;
export function transformMap<I, O>(map: ImmutableMap<I>, transformer: Transformer<I, O>): ImmutableMap<O> {
	return new Map(yieldTransformedValues(map, transformer));
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
	return Object.fromEntries(yieldTransformedValues(Object.entries(obj), transformer));
}

/** Set of named transformers for a data object. */
export type PropTransformers<T extends Data> = { readonly [K in keyof T]?: Transformer<T[K], T[K]> };

/** Apply transformers to the props of a data object and yield any props that changed. */
function* yieldTransformedProps<T extends Data>(existing: T, transformers: PropTransformers<T>): Generator<Prop<T>, void> {
	for (const [k, v] of toProps<{ readonly [K in keyof T]: Transformer<T[K], T[K]> }>(transformers)) yield [k, transform<Value<T>, Value<T>>(existing[k], v)];
}

/**
 * Transform a data object using a set of transformers for its props.
 * @returns New object with changed props (or the same object if no changes were made).
 */
export function transformData<T extends Data>(existing: T, transformers: PropTransformers<T>): T {
	return Object.fromEntries(yieldMerged(toProps(existing), yieldTransformedProps(existing, transformers))) as T;
}

/** Set of named transformers for a a map-like object. */
export type EntryTransformers<T> = ImmutableObject<Transformer<T | undefined, T>>;

/** Apply named transformers to the entries of a map-like object and yield any entries that changed. */
function* yieldTransformedEntries<T>(existing: ImmutableObject<T>, updates: EntryTransformers<T>): Generator<Entry<T>, void> {
	for (const [k, t] of Object.entries(updates)) yield [k, transform(existing[k], t)];
}

/** Transform some of the entries of a map-like object using a set of named transformers. */
export function transformEntries<T>(existing: ImmutableObject<T>, updates: EntryTransformers<T>, deletes: ImmutableArray<string>): ImmutableObject<T> {
	return Object.fromEntries(yieldFiltered(yieldMerged(Object.entries(existing), yieldTransformedEntries(existing, updates)), KEY_IN, deletes));
}
