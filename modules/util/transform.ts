import type { ImmutableArray } from "./array.js";
import type { DictionaryItem, ImmutableDictionary } from "./dictionary.js";
import { getDictionaryItems } from "./dictionary.js";
import type { Entry } from "./entry.js";
import type { Arguments } from "./function.js";
import type { ImmutableObject, MutableObject, Prop, Value } from "./object.js";
import { getProps } from "./object.js";

/** Set of named transforms for a data object (or `undefined` to skip the transform). */
export type Transforms<I extends ImmutableObject, O extends ImmutableObject, A extends Arguments = []> = {
	readonly [K in keyof I]?: (input: I[K], ...args: A) => O[K];
};

/** Modify a set of items using a transform. */
export function* mapItems<I, O, A extends Arguments = []>(items: Iterable<I>, transform: (v: I, ...args: A) => O, ...args: A): Iterable<O> {
	for (const item of items) yield transform(item, ...args);
}

/** Modify the items of an array using a transform. */
export function mapArray<I, O, A extends Arguments = []>(
	arr: Iterable<I>,
	transform: (v: I, ...args: A) => O,
	...args: A
): ImmutableArray<O> {
	return Array.from(mapItems(arr, transform, ...args));
}

/** Modify the _values_ of the props of an object using a transform. */
export function mapProps<I extends ImmutableObject, O extends ImmutableObject, A extends Arguments = []>(
	obj: I,
	transform: (prop: Prop<I>, ...args: A) => Value<O>,
	...args: A
): O {
	return Object.fromEntries(mapEntries(getProps(obj), transform, ...args)) as O;
}

/** Modify the _values_ of a dictionary using a transform. */
export function mapDictionary<I, O, A extends Arguments = []>(
	dictionary: ImmutableDictionary<I>,
	transform: (item: DictionaryItem<I>, ...args: A) => O,
	...args: A
): ImmutableDictionary<O> {
	return Object.fromEntries(mapEntries(getDictionaryItems(dictionary), transform, ...args));
}

/** Modify the _values_ of a set of entries using a transform. */
export function* mapEntries<K, I, O, A extends Arguments = []>(
	entries: Iterable<Entry<K, I>>,
	transform: (entry: Entry<K, I>, ...args: A) => O,
	...args: A
): Iterable<Entry<K, O>> {
	for (const e of entries) yield [e[0], transform(e, ...args)];
}

/**
 * Transform an object using a set of named transforms.
 *
 * @returns Transformed object (or same object if no changes were made).
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

/** Transform items in a sequence as they are yielded using a (potentially async) transform. */
export async function* mapSequence<I, O, A extends Arguments = []>(
	sequence: AsyncIterable<I>,
	transform: (input: I, ...args: A) => O | PromiseLike<O>,
	...args: A
): AsyncIterable<O> {
	for await (const item of sequence) yield transform(item, ...args);
}
