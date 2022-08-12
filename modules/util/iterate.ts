import type { Mutable } from "./data.js";
import type { ImmutableMap } from "./map.js";
import type { ImmutableArray } from "./array.js";

/**`Iterable that specifies return types and next types for the iterator (normally in Typescript these are `void` */
export interface TypedIterable<T, R, N> {
	[Symbol.iterator](): Iterator<T, R, N>;
}

/**
 * Is a value an iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export const isIterable = <T extends Iterable<unknown>>(value: T | unknown): value is T => typeof value === "object" && !!value && Symbol.iterator in value;

/**
 * Is a value an async iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export const isAsyncIterable = <T extends AsyncIterable<unknown>>(value: T | unknown): value is T => typeof value === "object" && !!value && Symbol.asyncIterator in value;

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

/** An iterable possibly containing multiple other iterables. */
export type DeepIterable<T> = T | Iterable<DeepIterable<T>>;

/** Flatten one or more iterables. */
export function* flattenDeepIterable<T>(items: DeepIterable<T>): Iterable<T> {
	if (isIterable(items)) for (const item of items) yield* flattenDeepIterable(item);
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
	for (const input of inputs) for (const item of input) yield item;
}

/** Abstract iterator designed to be extended that implements the full iterator/generator protocol. */
export abstract class AbstractIterator<T, R, N> implements Generator<T, R, N> {
	// Implement `Iterator`
	abstract next(value: N): IteratorResult<T, R>;
	throw(thrown: Error | unknown): IteratorResult<T, R> {
		// Default behaviour for a generator is to throw the error back out of the iterator and not continue.
		throw thrown;
	}
	return(value: R): IteratorResult<T, R> {
		// Default behaviour for a generator is to return `done: true` and the input value.
		return { done: true, value };
	}
	// Implement `Iterable`
	[Symbol.iterator](): Generator<T, R, N> {
		return this;
	}
}

/** Iterator that passes values through to a source iterator. */
export abstract class ThroughIterator<T, R, N> extends AbstractIterator<T, R, N> {
	protected _source: Iterator<T, R, N>;
	constructor(source: TypedIterable<T, R, N>) {
		super();
		this._source = source[Symbol.iterator]();
	}

	// Implement `Iterator`
	next(value: N): IteratorResult<T, R> {
		return this._source.next(value);
	}
	override throw(thrown: Error | unknown): IteratorResult<T, R> {
		return this._source.throw ? this._source.throw(thrown) : super.throw(thrown);
	}
	override return(value: R): IteratorResult<T, R> {
		return this._source.return ? this._source.return(value) : super.return(value);
	}
}

/**
 * Keep information about the items yielded by an iterator.
 * - Stores: first/last yielded value, returned value, whether iteration is done, the number of items in the sequence.
 *
 * @example
 * 	const watch = new WatchIterator(iterable);
 * 	for (const next of capture) console.log("YIELDED", next);
 * 	console.log("FIRST", watch.first);
 * 	console.log("RETURNED", watch.returned);
 */
export class WatchIterator<T, R, N> extends ThroughIterator<T, R, N> {
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

	// Override to watch returned values.
	override next(value: N): IteratorResult<T, R> {
		return this._watch(super.next(value));
	}
	override throw(thrown: Error | unknown): IteratorResult<T, R> {
		return this._watch(super.throw(thrown));
	}
	override return(value: R): IteratorResult<T, R> {
		return this._watch(super.return(value));
	}
	protected _watch(result: IteratorResult<T, R>): IteratorResult<T, R> {
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
}
