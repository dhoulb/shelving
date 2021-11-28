import type { Mutable } from "./object.js";
import type { ImmutableMap } from "./map.js";
import type { ImmutableArray } from "./array.js";
import type { Entry } from "./entry.js";

/** `Iterable` interface that specifies a return type for the iterator. */
export interface TypedIterable<T, R> extends Iterable<T> {
	[Symbol.iterator](): Iterator<T, R, undefined>;
}

/**
 * Is a value an iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export const isIterable = <T extends Iterable<unknown>>(value: T | unknown): value is T => typeof value === "object" && !!value && Symbol.iterator in value;

/** Get the known size or length of an object (e.g. `Array`, `Map`, and `Set` have known size), or return `undefined` if the size cannot be established. */
export const getSize = (obj: Iterable<unknown> | ImmutableMap | ImmutableArray): number | undefined =>
	"size" in obj && typeof obj.size === "number" ? obj.size : "length" in obj && typeof obj.length === "number" ? obj.length : undefined;

/**
 * Count the number items of an iterable.
 * - Checks `items.size` or `items.length` first, or consumes the iterable and counts its iterations.
 */
export function countItems(items: Iterable<unknown>): number {
	return getSize(items) ?? countIterations(items);
}

/**
 * Count the number of iterations an iterable does.
 * - Note: this consumes the iterable so you won't be able to use it again.
 */
export function countIterations(items: Iterable<unknown>): number {
	let count = 0;
	for (const unused of items) count++; // eslint-disable-line @typescript-eslint/no-unused-vars
	return count;
}

/** Sum an iterable set of numbers and return the total. */
export function sumItems(input: Iterable<number>): number {
	let sum = 0;
	for (const num of input) sum += num;
	return sum;
}

/**
 * Yield a range of numbers from `start` to `end`
 * - Yields in descending order if `end` is lower than `start`
 */
export function* yieldRange(start: number, end: number): Generator<number, void> {
	if (start <= end) for (let num = start; num <= end; num++) yield num;
	else for (let num = start; num >= end; num--) yield num;
}

/**
 * Apply a limit to an iterable set of items.
 * - Checks `items.size` or `items.length` first to see if the limit is necessary.
 */
export function limitItems<T>(items: Iterable<T>, limit: number): TypedIterable<T, void> {
	const size = getSize(items) ?? Infinity;
	return size <= limit ? items : limitIterations(items, limit);
}

/**
 * Limit the number of iterations an iterable does.
 */
export function* limitIterations<T>(items: Iterable<T>, limit: number): Generator<T, void> {
	let count = 0;
	for (const item of items) {
		if (++count <= limit) yield item;
		else break;
	}
}

/** Yield the keys of an iterable set of entries. */
export function* yieldKeys(input: Iterable<Entry>): Generator<string, void> {
	for (const [k] of input) yield k;
}

/** Yield the values of an iterable set of entries. */
export function* yieldValues<T>(input: Iterable<Entry<T>>): Generator<T, void> {
	for (const [, v] of input) yield v;
}

/** Yield chunks of a given size. */
export function* yieldChunks<T>(input: Iterable<T>, size: number): Generator<ImmutableArray<T>, void> {
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

/** Merge two or more iterables into a single set. */
export function* yieldMerged<T>(...inputs: [Iterable<T>, Iterable<T>, ...Iterable<T>[]]): Generator<T, void> {
	for (const input of inputs) for (const item of input) yield item;
}

/**
 * Keep information about the items yielded by an iterator.
 * - Stores: first/last yielded value, returned value, whether iteration is done, the number of items in the sequence.
 *
 * @example
 * 	const returned = new ReturnIterator(iterable);
 * 	for (const next of capture) console.log("YIELDED", next);
 * 	console.log("RETURNED", returned.value);
 */
export class IterationWatcher<T, R> implements Iterator<T, R>, TypedIterable<T, R> {
	protected _source: Iterator<T, R>;

	/** Get the number of results received by this iterator so far. */
	readonly count = 0;

	/** Is the iteration done? */
	readonly done: boolean = false;

	/** The first yielded value. */
	readonly first: T | undefined = undefined;

	/** The last yielded value. */
	readonly last: T | undefined = undefined;

	/** The returned value. */
	readonly returned: R | undefined = undefined;

	/**
	 * @param source The source iterator or iterable to capture the return value from.
	 */
	constructor(source: Iterator<T, R> | TypedIterable<T, R>) {
		this._source = isIterable(source) ? source[Symbol.iterator]() : source;
	}

	// Override to save received values.
	next() {
		const result = this._source.next();
		if (!result.done) {
			if (this.first === undefined) (this as Mutable<this>).first = result.value;
			(this as Mutable<this>).last = result.value;
			(this as Mutable<this>).count++;
		} else {
			(this as Mutable<this>).returned = result.value;
			(this as Mutable<this>).done = true;
		}
		return result;
	}

	// Implement `Iterable`
	[Symbol.iterator](): Iterator<T, R> {
		return this;
	}
}
