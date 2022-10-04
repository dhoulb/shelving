import type { ArrayItem, ImmutableArray } from "./array.js";
import type { Entry } from "./entry.js";
import { isFunction } from "./function.js";
import { getProps, ImmutableObject, isObject, ObjectProp, ObjectValue } from "./object.js";
import { ImmutableDictionary } from "./dictionary.js";

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

/** Transform a value using a transformer. */
export function transform<I, O>(input: I, transformer: (v: I) => O): O; // Helps `O` carry through functions that use generics.
export function transform<I, O>(input: I, transformer: Transformer<I, O>): O; // No promise returned with synchronous transformer.
export function transform<I, O>(input: I, transformer: Transformer<I, O>): O {
	return isFunction(transformer) ? transformer(input) : isTransformable(transformer) ? transformer.transform(input) : transformer;
}

/** Modify a set of items using a transformer. */
export function* mapItems<I, O>(items: Iterable<I>, transformer: Transformer<I, O>): Iterable<O> {
	for (const item of items) yield transform(item, transformer);
}

/** Modify the items of an array using a transformer. */
export function mapArray<T extends ImmutableArray>(arr: T, transformer: Transformer<ArrayItem<T>, ArrayItem<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function mapArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O>;
export function mapArray<I, O>(arr: Iterable<I>, transformer: Transformer<I, O>): ImmutableArray<O> {
	return Array.from(mapItems(arr, transformer));
}

/** Modify the values of the props of an object using a transformer. */
export function mapObject<T extends ImmutableObject>(obj: T, transformer: Transformer<ObjectValue<T>, ObjectValue<T>>): T;
export function mapObject<I extends ImmutableObject, O extends ImmutableObject>(obj: I, transformer: Transformer<ObjectValue<I>, ObjectValue<O>>): O;
export function mapObject(obj: ImmutableObject, transformer: Transformer<unknown, unknown>): ImmutableObject {
	return Object.fromEntries(mapEntries(getProps(obj), transformer));
}

/** Modify the values of a dictionary using a transformer. */
export const mapDictionary: <I, O>(dictionary: ImmutableDictionary<I>, transformer: Transformer<I, O>) => ImmutableDictionary<O> = mapObject;

/** Modify the values of a set of entries using a transformer. */
export function* mapEntries<K, I, O>(entries: Iterable<Entry<K, I>>, transformer: Transformer<I, O>): Iterable<Entry<K, O>> {
	for (const [k, v] of entries) yield [k, transform(v, transformer)];
}

/** Set of named transformers for a data object (or `undefined` to skip the transform). */
export type Transformers<T extends ImmutableObject> = { readonly [K in keyof T]?: Transformer<T[K], T[K]> | undefined };

/** Transform an object using a set of named transformers. */
export function transformObject<T extends ImmutableObject>(obj: T, transforms: Transformers<T>): T {
	return { ...obj, ...Object.fromEntries(_transformObjectProps(obj, transforms)) };
}
function* _transformObjectProps<T extends ImmutableObject>(obj: T, transforms: Transformers<T>): Iterable<ObjectProp<T>> {
	for (const [k, v] of getProps(transforms)) if (v !== undefined) yield [k, transform<ObjectValue<T>, ObjectValue<T>>(obj[k], v as ObjectValue<T>)];
}

/** Transform a dictionary object using a set of named transformers. */
export const transformDictionary: <T>(dict: ImmutableDictionary<T>, transforms: Transformers<ImmutableDictionary<T>>) => ImmutableDictionary<T> = transformObject;
