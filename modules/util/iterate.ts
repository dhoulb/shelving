/**
 * Is an unknown value an iterable?
 *
 * @param value The value to test.
 * @returns `true` if `value` is an object with a `Symbol.iterator` method, otherwise `false`.
 * @see https://shelving.cc/util/iterate/isIterable
 */
export function isIterable(value: unknown): value is Iterable<unknown> {
	return typeof value === "object" && !!value && Symbol.iterator in value;
}

/**
 * An iterable containing items or nested iterables of items.
 *
 * @see https://shelving.cc/util/iterate/DeepIterable
 */
export type DeepIterable<T> = T | Iterable<DeepIterable<T>>;

/**
 * Flatten one or more (possibly nested) iterables into a flat sequence of items.
 *
 * @param items The item or deeply-nested iterable of items to flatten.
 * @returns An iterable yielding every leaf item in order.
 * @example Array.from(flattenItems([1, [2, [3, 4]]])) // [1, 2, 3, 4]
 * @see https://shelving.cc/util/iterate/flattenItems
 */
export function* flattenItems<T>(items: DeepIterable<T>): Iterable<T> {
	if (isIterable(items)) for (const item of items) yield* flattenItems(item);
	else yield items;
}

/**
 * Does an iterable have one or more items.
 * - Stops as soon as the first item is found, so it never fully consumes the iterable.
 *
 * @param items The iterable to test.
 * @returns `true` if the iterable yields at least one item, otherwise `false`.
 * @example hasItems([1, 2, 3]) // true
 * @see https://shelving.cc/util/iterate/hasItems
 */
export function hasItems(items: Iterable<unknown>): boolean {
	for (const _unused of items) return true;
	return false;
}

/**
 * Count the number of items in an iterable.
 * - Fully consumes the iterable to count its iterations.
 *
 * @param items The iterable to count.
 * @returns The number of items yielded by the iterable.
 * @example countItems([1, 2, 3]) // 3
 * @see https://shelving.cc/util/iterate/countItems
 */
export function countItems(items: Iterable<unknown>): number {
	let count = 0;
	for (const _unused of items) count++;
	return count;
}

/**
 * Yield a range of numbers from `start` to `end`
 * - Yields in descending order if `end` is lower than `start`
 * - Both `start` and `end` are inclusive.
 *
 * @param start The first number to yield.
 * @param end The last number to yield (inclusive).
 * @returns An iterable yielding the numbers between `start` and `end`.
 * @example Array.from(getRange(1, 4)) // [1, 2, 3, 4]
 * @see https://shelving.cc/util/iterate/getRange
 */
export function* getRange(start: number, end: number): Iterable<number> {
	if (start <= end) for (let num = start; num <= end; num++) yield num;
	else for (let num = start; num >= end; num--) yield num;
}

/**
 * Apply a limit to an iterable set of items.
 * - Stops yielding once `limit` items have been produced.
 *
 * @param items The iterable to limit.
 * @param limit The maximum number of items to yield.
 * @returns An iterable yielding at most `limit` items.
 * @example Array.from(limitItems([1, 2, 3, 4], 2)) // [1, 2]
 * @see https://shelving.cc/util/iterate/limitItems
 */
export function* limitItems<T>(items: Iterable<T>, limit: number): Iterable<T> {
	let count = 0;
	if (count >= limit) return;
	for (const item of items) {
		yield item;
		count++;
		if (count >= limit) return;
	}
}

/**
 * Pick items from an iterable set of items.
 * - Only yields items that appear in the `pick` list.
 *
 * @param items The iterable to filter.
 * @param pick The items to keep.
 * @returns An iterable yielding only the items found in `pick`.
 * @example Array.from(pickItems([1, 2, 3], 1, 3)) // [1, 3]
 * @see https://shelving.cc/util/iterate/pickItems
 */
export function* pickItems<T>(items: Iterable<T>, ...pick: T[]): Iterable<T> {
	for (const item of items) if (pick.includes(item)) yield item;
}

/**
 * Omit items from an iterable set of items.
 * - Yields every item except those that appear in the `omit` list.
 *
 * @param items The iterable to filter.
 * @param omit The items to remove.
 * @returns An iterable yielding every item not found in `omit`.
 * @example Array.from(omitItems([1, 2, 3], 2)) // [1, 3]
 * @see https://shelving.cc/util/iterate/omitItems
 */
export function* omitItems<T>(items: Iterable<T>, ...omit: T[]): Iterable<T> {
	for (const item of items) if (!omit.includes(item)) yield item;
}

/**
 * Reduce an iterable set of items using a reducer function.
 * - Calls `reducer` for each item, threading the accumulated value through.
 *
 * @param items The iterable to reduce.
 * @param reducer Reducer called with the previous accumulated value and the current item, returning the next accumulated value.
 * @param initial The initial accumulated value.
 * @returns The final accumulated value, or `undefined` if the iterable is empty and no `initial` was given.
 * @example reduceItems([1, 2, 3], (a, b) => a + b, 0) // 6
 * @see https://shelving.cc/util/iterate/reduceItems
 */
export function reduceItems<T>(items: Iterable<T>, reducer: (previous: T, item: T) => T, initial: T): T;
export function reduceItems<T>(items: Iterable<T>, reducer: (previous: T | undefined, item: T) => T, initial?: T): T | undefined;
export function reduceItems<I, O>(items: Iterable<I>, reducer: (previous: O, item: I) => O, initial: O): O;
export function reduceItems<I, O>(items: Iterable<I>, reducer: (previous: O | undefined, item: I) => O, initial?: O): O | undefined;
export function reduceItems<T>(items: Iterable<T>, reducer: (previous: T | undefined, item: T) => T, initial?: T): T | undefined {
	let current = initial;
	for (const item of items) current = reducer(current, item);
	return current;
}

/**
 * Yield chunks of a given size.
 * - The final chunk may contain fewer than `size` items.
 *
 * @param items The iterable to split into chunks.
 * @param size The maximum number of items per chunk.
 * @returns An iterable yielding arrays of up to `size` items.
 * @example Array.from(getChunks([1, 2, 3, 4, 5], 2)) // [[1, 2], [3, 4], [5]]
 * @see https://shelving.cc/util/iterate/getChunks
 */
export function* getChunks<T>(items: Iterable<T>, size: number): Iterable<readonly T[]> {
	let chunk: T[] = [];
	for (const item of items) {
		chunk.push(item);
		if (chunk.length >= size) {
			yield chunk;
			chunk = [];
		}
	}
	if (chunk.length) yield chunk;
}

/**
 * Merge two or more iterables into a single iterable set.
 * - Yields all items from each input in order.
 *
 * @param inputs Two or more iterables to merge.
 * @returns An iterable yielding every item from each input in sequence.
 * @example Array.from(mergeItems([1, 2], [3, 4])) // [1, 2, 3, 4]
 * @see https://shelving.cc/util/iterate/mergeItems
 */
export function* mergeItems<T>(...inputs: [Iterable<T>, Iterable<T>, ...Iterable<T>[]]): Iterable<T> {
	for (const input of inputs) yield* input;
}

/**
 * Interleave items with a separator, i.e. `[item1, separator, item2, separator, item3]`
 *
 * @param items The iterable to interleave.
 * @param separator The value to insert between each pair of items.
 * @returns An iterable yielding the items with `separator` between them.
 * @example Array.from(interleaveItems([1, 2, 3], 0)) // [1, 0, 2, 0, 3]
 * @see https://shelving.cc/util/iterate/interleaveItems
 */
export function interleaveItems<T>(items: Iterable<T>, separator: T): Iterable<T>;
export function interleaveItems<A, B>(items: Iterable<A>, separator: B): Iterable<A | B>;
export function* interleaveItems<T>(items: Iterable<T>, separator: T): Iterable<T> {
	let first = true;
	for (const item of items) {
		if (!first) yield separator;
		yield item;
		first = false;
	}
}
