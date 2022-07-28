import { isFunction } from "./function.js";
import { Data, Value, Prop, getProps, isData } from "./data.js";
import type { Entry } from "./entry.js";
import { getEntries, ImmutableObject } from "./object.js";
import { ArrayType, ImmutableArray } from "./array.js";

/** Object that transforms an input value into an output value with its `transform()` method. */
export interface Transformable<I, O> {
	transform(input: I): O;
}

/** Is an unknown value a derivable. */
export const isTransformable = <T extends Transformable<unknown, unknown>>(v: T | unknown): v is T => isData(v) && typeof v.transform === "function";

/** Function that can transform an input value into an output value. */
export type Transform<I, O> = (input: I) => O;

/** Something that can transform an input value into an output value (or a plain value). */
export type Transformer<I, O> = Transformable<I, O> | Transform<I, O> | O;

/** Transform a value using a transform. */
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
export function transformData<T extends Data>(data: T, transforms: PropTransformers<T>): T {
	return { ...data, ...Object.fromEntries(transformProps(data, transforms)) };
}

/**
 * Transform the props of a data object using a set of prop transformers.
 * @yield Transformed prop entry after calling the corresponding prop transformer.
 */
export function* transformProps<T extends Data>(data: T, transforms: PropTransformers<T>): Iterable<Prop<T>> {
	for (const [k, v] of getProps<{ readonly [K in keyof T]: Transformer<T[K], T[K]> }>(transforms)) yield [k, transform<Value<T>, Value<T>>(data[k], v)];
}

/**
 * Transform the _values_ of an iterable set of entries using a transformer.
 * @yield Transformed entry after calling transforming the new value for each entry.
 */
export function mapEntries<I, O>(entries: Iterable<Entry<I>>, transformer: (v: I) => O): Iterable<Entry<O>>; // Helps `O` carry through functions that use generics.
export function mapEntries<I, O>(entries: Iterable<Entry<I>>, transformer: Transformer<I, O>): Iterable<Entry<O>>;
export function* mapEntries<I, O>(entries: Iterable<Entry<I>>, transformer: Transformer<I, O>): Iterable<Entry<O>> {
	for (const [k, v] of entries) yield [k, transform(v, transformer)];
}

/**
 * Transform the _values_ of an object using a transformer.
 * @return New object after transforming its entries.
 */
export function mapObject<T extends Data>(obj: T, transformer: Transformer<Value<T>, Value<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function mapObject<I extends Data, O extends { [K in keyof I]: unknown }>(obj: I, transformer: Transformer<Value<I>, Value<O>>): O; // Transform an entire object with the same props with different types.
export function mapObject<I, O>(obj: ImmutableObject<I>, transformer: (v: I) => O): ImmutableObject<O>; // Helps `O` carry through functions that use generics.
export function mapObject<I, O>(obj: ImmutableObject<I>, transformer: Transformer<I, O>): ImmutableObject<O>;
export function mapObject<I, O>(obj: ImmutableObject<I>, transformer: Transformer<I, O>): ImmutableObject<O> {
	return Object.fromEntries(mapEntries(getEntries(obj), transformer));
}

/**
 * Map an iterable set of items using a transformer.
 * @yield Transformed items after calling `transformer()` on each.
 */
export function mapItems<I, O>(items: Iterable<I>, transformer: (input: I) => O): Iterable<O>; // Helps `O` carry through functions that use generics.
export function mapItems<I, O>(items: Iterable<I>, transformer: Transformer<I, O>): Iterable<O>;
export function* mapItems<I, O>(items: Iterable<I>, transformer: Transformer<I, O>): Iterable<O> {
	for (const item of items) yield transform(item, transformer);
}

/**
 * Apply a transformer to each item in an array and return the transformed array.
 * @return The transformed array.
 */
export function mapArray<T extends ImmutableArray>(arr: T, transformer: Transformer<ArrayType<T>, ArrayType<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function mapArray<I, O>(arr: Iterable<I>, transformer: (v: I) => O): ImmutableArray<O>; // Helps `O` carry through functions that use generics.
export function mapArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O>;
export function mapArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O> {
	return Array.from(mapItems(arr, transformer));
}
