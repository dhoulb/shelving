import type { ImmutableMap } from "./map.js";
import type { ImmutableArray } from "./array.js";

/**
 * Is a value an iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export const isIterable = <T extends Iterable<unknown>>(value: T | unknown): value is T => typeof value === "object" && !!value && Symbol.iterator in value;

/** Get the known size or length of an object (e.g. `Array`, `Map`, and `Set` have known size), or return `undefined` if the size cannot be established. */
function _getKnownSize(obj: Iterable<unknown> | ImmutableMap<unknown, unknown> | ImmutableArray<unknown>): number | undefined {
	if ("size" in obj && typeof obj.size === "number") return obj.size;
	if ("length" in obj && typeof obj.length === "number") return obj.length;
}

/**
 * Count the number items of an iterable.
 * - Checks `items.size` or `items.length` first, or consumes the iterable and counts its iterations.
 */
export function countItems(items: Iterable<unknown>): number {
	return _getKnownSize(items) ?? _countItems(items);
}
function _countItems(items: Iterable<unknown>): number {
	let count = 0;
	for (const unused of items) count++;
	return count;
}

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
	return !!(_getKnownSize(items) ?? _hasItems(items));
}
function _hasItems(items: Iterable<unknown>): boolean {
	for (const unused of items) return true;
	return false;
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
export function limitItems<T>(items: Iterable<T>, limit: number): Iterable<T> {
	const size = _getKnownSize(items) ?? Infinity;
	return size <= limit ? items : _limitItems(items, limit);
}
function* _limitItems<T>(source: Iterable<T>, limit: number): Iterable<T> {
	let count = 0;
	if (count >= limit) return;
	for (const item of source) {
		yield item;
		count++;
		if (count >= limit) break;
	}
}

/** Reduce an iterable set of items using a reducer function. */
export function reduceItems<T>(items: Iterable<T>, reducer: (previous: T, item: T) => T, initial: T): T;
export function reduceItems<T>(items: Iterable<T>, reducer: (previous: T | undefined, item: T) => T, initial?: T): T | undefined;
export function reduceItems<T>(items: Iterable<T>, reducer: (previous: T | undefined, item: T) => T, initial?: T): T | undefined {
	let current = initial;
	for (const item of items) current = reducer(current, item);
	return current;
}

/** Yield chunks of a given size. */
export function getChunks<T>(input: Iterable<T>, size: 1): Iterable<readonly [T]>;
export function getChunks<T>(input: Iterable<T>, size: 2): Iterable<readonly [T, T]>;
export function getChunks<T>(input: Iterable<T>, size: 3): Iterable<readonly [T, T, T]>;
export function getChunks<T>(input: Iterable<T>, size: 4): Iterable<readonly [T, T, T, T]>;
export function getChunks<T>(input: Iterable<T>, size: number): Iterable<ImmutableArray<T>>;
export function* getChunks<T>(input: Iterable<T>, size: number): Iterable<ImmutableArray<T>> {
	let chunk: T[] = [];
	for (const item of input) {
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
