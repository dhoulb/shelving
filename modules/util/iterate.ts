/** Is an unknown value an iterable? */
export const isIterable = (value: unknown): value is Iterable<unknown> => typeof value === "object" && !!value && Symbol.iterator in value;

/** An iterable containing items or nested iterables of items. */
export type DeepIterable<T> = T | Iterable<DeepIterable<T>>;

/** Flatten one or more iterables. */
export function* flattenItems<T>(items: DeepIterable<T>): Iterable<T> {
	if (isIterable(items)) for (const item of items) yield* flattenItems(item);
	else yield items;
}

/**
 * Does an iterable have one or more items.
 * - Checks `items.size` or `items.length` first, or consumes the iterable and counts its iterations.
 */
export function hasItems(items: Iterable<unknown>): boolean {
	for (const unused of items) return true;
	return false;
}

/** Is an unknown value one of the values of an iterable? */
export function isItem<T>(items: Iterable<T>, value: unknown): value is T {
	for (const item of items) if (value === item) return true;
	return false;
}

/** Count the number of items in an iterable. */
export function countItems(items: Iterable<unknown>): number {
	let count = 0;
	for (const unused of items) count++;
	return count;
}

/**
 * Yield a range of numbers from `start` to `end`
 * - Yields in descending order if `end` is lower than `start`
 */
export function* getRange(start: number, end: number): Iterable<number> {
	if (start <= end) for (let num = start; num <= end; num++) yield num;
	else for (let num = start; num >= end; num--) yield num;
}

/**
 * Apply a limit to an iterable set of items.
 * - Checks `items.size` or `items.length` first to see if the limit is necessary.
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

/** Pick items from an iterable set of items. */
export function* pickItems<T>(items: Iterable<T>, ...pick: T[]): Iterable<T> {
	for (const item of items) if (pick.includes(item)) yield item;
}

/** Omit items from an iterable set of items. */
export function* omitItems<T>(items: Iterable<T>, ...omit: T[]): Iterable<T> {
	for (const item of items) if (!omit.includes(item)) yield item;
}

/** Reduce an iterable set of items using a reducer function. */
export function reduceItems<T>(items: Iterable<T>, reducer: (previous: T, item: T) => T, initial: T): T;
export function reduceItems<T>(items: Iterable<T>, reducer: (previous: T | undefined, item: T) => T, initial?: T): T | undefined;
export function reduceItems<I, O>(items: Iterable<I>, reducer: (previous: O, item: I) => O, initial: O): O;
export function reduceItems<I, O>(items: Iterable<I>, reducer: (previous: O | undefined, item: I) => O, initial?: O): O | undefined;
export function reduceItems<T>(items: Iterable<T>, reducer: (previous: T | undefined, item: T) => T, initial?: T): T | undefined {
	let current = initial;
	for (const item of items) current = reducer(current, item);
	return current;
}

/** Yield chunks of a given size. */
export function getChunks<T>(items: Iterable<T>, size: 1): Iterable<readonly [T]>;
export function getChunks<T>(items: Iterable<T>, size: 2): Iterable<readonly [T, T]>;
export function getChunks<T>(items: Iterable<T>, size: 3): Iterable<readonly [T, T, T]>;
export function getChunks<T>(items: Iterable<T>, size: 4): Iterable<readonly [T, T, T, T]>;
export function getChunks<T>(items: Iterable<T>, size: number): Iterable<readonly T[]>;
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

/** Merge two or more iterables into a single iterable set. */
export function* mergeItems<T>(...inputs: [Iterable<T>, Iterable<T>, ...Iterable<T>[]]): Iterable<T> {
	for (const input of inputs) yield* input;
}
