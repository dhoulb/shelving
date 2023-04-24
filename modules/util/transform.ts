import type { ArrayItem, ImmutableArray } from "./array.js";
import type { Entry } from "./entry.js";
import { Arguments, isFunction } from "./function.js";
import { getProps, ImmutableObject, isObject, MutableObject, ObjectValue } from "./object.js";
import { ImmutableDictionary, PossibleDictionary } from "./dictionary.js";

/** Object that transforms an input value into an output value with its `transform()` method. */
export interface Transformable<I, O, A extends Arguments = []> {
	transform(input: I, ...args: A): O;
}

/** Object that transforms an input value into an output value with its `transform()` method. */
export interface AsyncTransformable<I, O, A extends Arguments = []> {
	transform(input: I, ...args: A): O | PromiseLike<O>;
}

/** Is an unknown value a transformable. */
export const isTransformable = <T extends Transformable<unknown, unknown, Arguments>>(value: T | unknown): value is T => isObject(value) && typeof value.transform === "function";

/** Function that can transform an input value into an output value. */
export type Transform<I, O, A extends Arguments = []> = (input: I, ...args: A) => O;

/** Function that can transform an input value into an output value. */
export type AsyncTransform<I, O, A extends Arguments = []> = (input: I, ...args: A) => O | PromiseLike<O>;

/** Something that can transform an input value into an output value (or a plain value). */
export type Transformer<I, O, A extends Arguments = []> = Transformable<I, O, A> | Transform<I, O, A> | O;

/** Something that can transform an input value into an output value (or a plain value). */
export type AsyncTransformer<I, O, A extends Arguments = []> = AsyncTransformable<I, O, A> | AsyncTransform<I, O, A> | O;

/** Set of named transformers for a data object (or `undefined` to skip the transform). */
export type Transformers<T extends ImmutableObject, A extends Arguments = []> = { readonly [K in keyof T]?: Transformer<T[K], T[K], A> | undefined };

/** Transform a value using a transformer. */
export function transform<I, O, A extends Arguments = []>(input: I, transformer: (v: I) => O, ...args: A): O; // Helps `O` carry through functions that use generics.
export function transform<I, O, A extends Arguments = []>(input: I, transformer: (v: I) => O | PromiseLike<O>, ...args: A): O | PromiseLike<O>; // Helps `O` carry through functions that use generics.
export function transform<I, O, A extends Arguments = []>(input: I, transformer: Transformer<I, O, A>, ...args: A): O; // No promise returned with synchronous transformer.
export function transform<I, O, A extends Arguments = []>(input: I, transformer: AsyncTransformer<I, O, A>, ...args: A): O; // No promise returned with asynchronous transformer.
export function transform<I, O, A extends Arguments = []>(input: I, transformer: AsyncTransformer<I, O, A>, ...args: A): O | PromiseLike<O> {
	return isFunction(transformer) ? transformer(input, ...args) : isTransformable(transformer) ? transformer.transform(input, ...args) : transformer;
}

/** Modify a set of items using a transformer. */
export function mapItems<I, O, A extends Arguments = []>(items: Iterable<I>, transformer: (v: I, ...args: A) => O, ...args: A): Iterable<O>; // Helps `I` and `O` carry through functions that use generics.
export function mapItems<I, O, A extends Arguments = []>(items: Iterable<I>, transformer: Transformer<I, O, A>, ...args: A): Iterable<O>;
export function* mapItems<I, O, A extends Arguments = []>(items: Iterable<I>, transformer: Transformer<I, O, A>, ...args: A): Iterable<O> {
	for (const item of items) yield transform(item, transformer, ...args);
}

/** Modify the items of an array using a transformer. */
export function mapArray<T extends ImmutableArray>(arr: T, transformer: Transformer<ArrayItem<T>, ArrayItem<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function mapArray<I, O, A extends Arguments = []>(arr: Iterable<I>, transformer: (v: I, ...args: A) => O, ...args: A): ImmutableArray<O>; // Helps `I` and `O` carry through functions that use generics.
export function mapArray<I, O, A extends Arguments = []>(arr: Iterable<I>, transformer: Transformer<I, O, A>, ...args: A): ImmutableArray<O>;
export function mapArray<I, O, A extends Arguments = []>(arr: Iterable<I>, transformer: Transformer<I, O, A>, ...args: A): ImmutableArray<O> {
	return Array.from(mapItems(arr, transformer, ...args));
}

/** Modify the values of the props of an object using a transformer. */
export function mapObject<T extends ImmutableObject>(obj: T, transformer: Transformer<ObjectValue<T>, ObjectValue<T>>): T; // Passthrough for transformers that return the same type and remove nothing.
export function mapObject<I extends ImmutableObject, O extends ImmutableObject, A extends Arguments = []>(obj: I, transformer: (v: ObjectValue<I>, ...args: A) => ObjectValue<O>, ...args: A): O; // Helps `I` and `O` carry through functions that use generics.
export function mapObject<I extends ImmutableObject, O extends ImmutableObject, A extends Arguments = []>(obj: I, transformer: Transformer<ObjectValue<I>, ObjectValue<O>>, ...args: A): O;
export function mapObject<I extends ImmutableObject, O extends ImmutableObject, A extends Arguments = []>(obj: I, transformer: Transformer<unknown, unknown>, ...args: A): O {
	return Object.fromEntries(mapEntries(getProps(obj), transformer, ...args)) as O;
}

/** Modify the values of a dictionary using a transformer. */
export const mapDictionary: <I, O, A extends Arguments = []>(dictionary: PossibleDictionary<I>, transformer: Transformer<I, O, A>, ...args: A) => ImmutableDictionary<O> = mapObject;

/** Modify the values of a set of entries using a transformer. */
export function* mapEntries<K, I, O, A extends Arguments = []>(entries: Iterable<Entry<K, I>>, transformer: Transformer<I, O, A>, ...args: A): Iterable<Entry<K, O>> {
	for (const [k, v] of entries) yield [k, transform(v, transformer, ...args)];
}

/**
 * Transform an object using a set of named transformers.
 *
 * @returns Transformed object (or same object if no changes were made).
 */
export function transformObject<T extends ImmutableObject, A extends Arguments = []>(obj: T, transforms: Transformers<T, A>, ...args: A): T;
export function transformObject<T extends ImmutableObject, A extends Arguments = []>(obj: T | Partial<T>, transforms: Transformers<T, A>, ...args: A): T | Partial<T>;
export function transformObject<A extends Arguments = []>(input: ImmutableObject, transforms: Transformers<ImmutableObject, A>, ...args: A): ImmutableObject {
	let changed = false;
	const output: MutableObject = { ...input };
	for (const [k, t] of getProps(transforms)) {
		const i = input[k];
		const o = transform(i, t, ...args);
		output[k] = o;
		if (!changed && i !== 0) changed = true;
	}
	return changed ? output : input;
}

/** Transform items in a sequence as they are yielded using a (potentially async) transformer. */
export function mapSequence<I, O, A extends Arguments = []>(sequence: AsyncIterable<I>, transformer: (input: I, ...args: A) => O | PromiseLike<O>, ...args: A): AsyncIterable<O>;
export function mapSequence<I, O, A extends Arguments = []>(sequence: AsyncIterable<I>, transformer: AsyncTransformer<I, O, A>, ...args: A): AsyncIterable<O>;
export async function* mapSequence<I, O, A extends Arguments = []>(sequence: AsyncIterable<I>, transformer: AsyncTransformer<I, O, A>, ...args: A): AsyncIterable<O> {
	for await (const item of sequence) yield transform(item, transformer, ...args);
}
