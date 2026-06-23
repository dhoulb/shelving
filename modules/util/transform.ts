import type { ImmutableArray } from "./array.js";
import type { ImmutableDictionary } from "./dictionary.js";
import { getDictionaryItems } from "./dictionary.js";
import type { Entry } from "./entry.js";
import type { Arguments } from "./function.js";
import type { ImmutableObject, MutableObject, Prop, Value } from "./object.js";
import { getProps } from "./object.js";

/**
 * Set of named transforms for a data object, keyed by prop name (or `undefined` to skip the transform for that prop).
 *
 * @see https://shelving.cc/util/transform/Transforms
 */
export type Transforms<I extends ImmutableObject, O extends ImmutableObject, A extends Arguments = []> = {
	readonly [K in keyof I]?: (input: I[K], ...args: A) => O[K];
};

/**
 * Lazily transform every item in an iterable.
 *
 * @param items The source iterable of items.
 * @param transform Function applied to each item to produce the output item.
 * @param args Additional arguments passed through to `transform` on every call.
 * @returns An iterable yielding each transformed item.
 * @example [...mapItems([1, 2], n => n * 2)] // [2, 4]
 * @see https://shelving.cc/util/transform/mapItems
 */
export function* mapItems<I, O, A extends Arguments = []>(items: Iterable<I>, transform: (v: I, ...args: A) => O, ...args: A): Iterable<O> {
	for (const item of items) yield transform(item, ...args);
}

/**
 * Transform every item of an iterable into a new array.
 *
 * @param arr The source iterable of items.
 * @param transform Function applied to each item to produce the output item.
 * @param args Additional arguments passed through to `transform` on every call.
 * @returns A new array containing each transformed item.
 * @example mapArray([1, 2], n => n * 2) // [2, 4]
 * @see https://shelving.cc/util/transform/mapArray
 */
export function mapArray<I, O, A extends Arguments = []>(
	arr: Iterable<I>,
	transform: (v: I, ...args: A) => O,
	...args: A
): ImmutableArray<O> {
	return Array.from(mapItems(arr, transform, ...args));
}

/**
 * Transform the values of an object's props into a new object.
 * - Keys are preserved; each prop entry is passed to `transform` to produce its new value.
 *
 * @param obj The source object.
 * @param transform Function applied to each `[key, value]` prop to produce the output value.
 * @param args Additional arguments passed through to `transform` on every call.
 * @returns A new object with the same keys and transformed values.
 * @example mapProps({ a: 1, b: 2 }, ([, v]) => v * 2) // { a: 2, b: 4 }
 * @see https://shelving.cc/util/transform/mapProps
 */
export function mapProps<I extends ImmutableObject, O extends ImmutableObject, A extends Arguments = []>(
	obj: I,
	transform: (prop: Prop<I>, ...args: A) => Value<O>,
	...args: A
): O {
	return Object.fromEntries(mapEntries(getProps(obj), transform, ...args)) as O;
}

/**
 * Transform the values of a dictionary into a new dictionary.
 * - Keys are preserved; each value is passed to `transform` to produce its new value.
 *
 * @param dictionary The source dictionary.
 * @param transform Function applied to each value to produce the output value.
 * @param args Additional arguments passed through to `transform` on every call.
 * @returns A new dictionary with the same keys and transformed values.
 * @example mapDictionary({ a: 1, b: 2 }, v => v * 2) // { a: 2, b: 4 }
 * @see https://shelving.cc/util/transform/mapDictionary
 */
export function mapDictionary<I, O, A extends Arguments = []>(
	dictionary: ImmutableDictionary<I>,
	transform: (value: I, ...args: A) => O,
	...args: A
): ImmutableDictionary<O> {
	return Object.fromEntries(mapEntryValues(getDictionaryItems(dictionary), transform, ...args));
}

/**
 * Lazily transform the values of a set of entries, keeping each key.
 * - The whole `[key, value]` entry is passed to `transform`, which returns the new value.
 *
 * @param entries The source iterable of `[key, value]` entries.
 * @param transform Function applied to each entry to produce the output value.
 * @param args Additional arguments passed through to `transform` on every call.
 * @returns An iterable of `[key, transformedValue]` entries.
 * @example [...mapEntries([["a", 1]], ([, v]) => v * 2)] // [["a", 2]]
 * @see https://shelving.cc/util/transform/mapEntries
 */
export function* mapEntries<K, I, O, A extends Arguments = []>(
	entries: Iterable<Entry<K, I>>,
	transform: (entry: Entry<K, I>, ...args: A) => O,
	...args: A
): Iterable<Entry<K, O>> {
	for (const e of entries) yield [e[0], transform(e, ...args)];
}

/**
 * Lazily transform the values of a set of entries, keeping each key.
 * - Only the value is passed to `transform`, which returns the new value.
 *
 * @param entries The source iterable of `[key, value]` entries.
 * @param transform Function applied to each value to produce the output value.
 * @param args Additional arguments passed through to `transform` on every call.
 * @returns An iterable of `[key, transformedValue]` entries.
 * @example [...mapEntryValues([["a", 1]], v => v * 2)] // [["a", 2]]
 * @see https://shelving.cc/util/transform/mapEntryValues
 */
export function* mapEntryValues<K, I, O, A extends Arguments = []>(
	entries: Iterable<Entry<K, I>>,
	transform: (value: I, ...args: A) => O,
	...args: A
): Iterable<Entry<K, O>> {
	for (const e of entries) yield [e[0], transform(e[1], ...args)];
}

/**
 * Transform an object using a set of named transforms.
 * - Each transform is keyed by prop name and applied to that prop's current value.
 * - Props with no transform are left untouched; the original object is returned unchanged if no transform alters a value.
 *
 * @param obj The source object to transform.
 * @param transforms Object of per-prop transform functions, keyed by prop name.
 * @param args Additional arguments passed through to each transform.
 * @returns Transformed object (or same object if no changes were made).
 * @example transformObject({ a: 1, b: 2 }, { a: n => n + 10 }) // { a: 11, b: 2 }
 * @see https://shelving.cc/util/transform/transformObject
 */
export function transformObject<T extends ImmutableObject, A extends Arguments = []>(
	obj: T,
	transforms: Transforms<T, T | Partial<T>, A>,
	...args: A
): T;
export function transformObject<T extends ImmutableObject, A extends Arguments = []>(
	obj: T | Partial<T>,
	transforms: Transforms<T, T | Partial<T>, A>,
	...args: A
): Partial<T>;
export function transformObject<I extends ImmutableObject, O extends ImmutableObject, A extends Arguments = []>(
	obj: I,
	transforms: Transforms<I, O | Partial<O>, A>,
	...args: A
): O;
export function transformObject<I extends ImmutableObject, O extends ImmutableObject, A extends Arguments = []>(
	obj: I | Partial<I>,
	transforms: Transforms<I, O | Partial<O>, A>,
	...args: A
): Partial<O>;
export function transformObject<A extends Arguments = []>(
	input: ImmutableObject,
	transforms: Transforms<ImmutableObject, ImmutableObject, A>,
	...args: A
): ImmutableObject {
	let changed = false;
	const output: MutableObject = { ...input };
	for (const [k, t] of getProps(transforms)) {
		if (t) {
			const i = input[k];
			const o = t(i, ...args);
			if (t === undefined) {
				delete output[k];
			} else {
				output[k] = o;
				if (!changed && i !== o) changed = true;
			}
		}
	}
	return changed ? output : input;
}

/**
 * Lazily transform items in an async sequence as they are yielded.
 * - The transform may be synchronous or return a promise; awaited values are yielded in order.
 *
 * @param sequence The source async iterable of items.
 * @param transform Function applied to each item to produce the output item (may be async).
 * @param args Additional arguments passed through to `transform` on every call.
 * @returns An async iterable yielding each transformed item.
 * @example for await (const n of mapSequence(source, x => x * 2)) use(n);
 * @see https://shelving.cc/util/transform/mapSequence
 */
export async function* mapSequence<I, O, A extends Arguments = []>(
	sequence: AsyncIterable<I>,
	transform: (input: I, ...args: A) => O | PromiseLike<O>,
	...args: A
): AsyncIterable<O> {
	for await (const item of sequence) yield transform(item, ...args);
}
