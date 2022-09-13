import type { ArrayItem, ImmutableArray } from "./array.js";
import type { Entry } from "./entry.js";
import { Data, DataProp, DataValue, getDataProps } from "./data.js";
import { isFunction } from "./function.js";
import { getObjectProps, ImmutableObject, isObject, ObjectProp, PossibleObject } from "./object.js";

/** Object that transforms an input value into an output value with its `transform()` method. */
export interface Transformable<I, O> {
	transform(input: I): O;
}

/** Is an unknown value a transformable. */
export const isTransformable = <T extends Transformable<unknown, unknown>>(v: T | unknown): v is T => isObject(v) && typeof v.transform === "function";

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

/**
 * Map an iterable set of items using a transformer.
 * @yield Transformed items after calling `transformer()` on each.
 */
export function* mapItems<I, O>(items: Iterable<I>, transformer: Transformer<I, O>): Iterable<O> {
	for (const item of items) yield transform(item, transformer);
}

/**
 * Apply a transformer to each item in an array and return the transformed array.
 * @return The transformed array.
 */
export function mapArray<T extends ImmutableArray>(arr: T, transformer: Transformer<ArrayItem<T>, ArrayItem<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function mapArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O>;
export function mapArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O> {
	return Array.from(mapItems(arr, transformer));
}

/** Transform the values of the props a map-like object using a transformer. */
export function mapObject<I, O>(obj: PossibleObject<I>, transformer: Transformer<I, O>): ImmutableObject<O> {
	return Object.fromEntries(mapObjectProps(obj, transformer));
}

/** Modify the values of the props of a map-like object using a single transformer. */
export function* mapObjectProps<I, O>(obj: PossibleObject<I>, transformer: Transformer<I, O>): Iterable<ObjectProp<ImmutableObject<O>>> {
	for (const [k, v] of getObjectProps(obj)) yield [k, transform(v, transformer)];
}

/** Modify the values of the props an iterable set of entries using a transformer. */
export function* mapEntries<K, I, O>(entries: Iterable<Entry<K, I>>, transformer: Transformer<I, O>): Iterable<Entry<K, O>> {
	for (const [k, v] of entries) yield [k, transform(v, transformer)];
}

/** Set of named transformers for a data object. */
export type Transformers<T extends Data> = { readonly [K in keyof T]?: Transformer<T[K], T[K]> };

/** Transform a data object using a set of named transformers. */
export function transformData<T extends Data>(data: T, transforms: Transformers<T>): T {
	return { ...data, ...Object.fromEntries(mapDataProps(data, transforms)) };
}

/** Modify the props of a data object using a set of named transformers. */
export function* mapDataProps<T extends Data>(obj: T, transforms: Transformers<T>): Iterable<DataProp<T>> {
	for (const [k, v] of getDataProps<{ readonly [K in keyof T]: Transformer<T[K], T[K]> }>(transforms)) yield [k, transform<DataValue<T>, DataValue<T>>(obj[k], v)];
}

/** Modify the values of the props of an data object using a single transformer. */
export function mapData<T extends Data>(data: T, transformer: Transformer<DataValue<T>, DataValue<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function mapData<I extends Data, O extends { [K in keyof I]: unknown }>(data: I, transformer: Transformer<DataValue<I>, DataValue<O>>): O; // Transform an entire object with the same props with different types.
export function mapData<I, O>(data: ImmutableObject<I>, transformer: Transformer<I, O>): ImmutableObject<O> {
	return mapObject(data, transformer);
}
