import type { Mutable } from "./data.js";
import type { ImmutableMap } from "./map.js";
import type { ImmutableArray } from "./array.js";
import type { Entry } from "./entry.js";
import { Delay } from "./async.js";
import { DONE } from "./constants.js";
import { Arguments } from "./function.js";

/** `Iterable` interface that specifies return types and next types for the iterator. */
export interface TypedIterable<T, R, N> {
	[Symbol.iterator](): Iterator<T, R, N>;
}

/** `AsyncIterable` interface that specifies return types and next types for the iterator. */
export interface TypedAsyncIterable<T, R, N> {
	[Symbol.asyncIterator](): AsyncIterator<T, R, N>;
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
const getKnownSize = (obj: Iterable<unknown> | ImmutableMap | ImmutableArray): number | undefined => ("size" in obj && typeof obj.size === "number" ? obj.size : "length" in obj && typeof obj.length === "number" ? obj.length : undefined);

/**
 * Count the number items of an iterable.
 * - Checks `items.size` or `items.length` first, or consumes the iterable and counts its iterations.
 */
export function countItems(items: Iterable<unknown>): number {
	return getKnownSize(items) ?? countIterations(items);
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

/**
 * Does an iterable have one or more items.
 * - Checks `items.size` or `items.length` first, or consumes the iterable and counts its iterations.
 */
export function hasItems(items: Iterable<unknown>): boolean {
	return !!(getKnownSize(items) ?? hasIterations(items));
}

/**
 * Does an iterable have one or more items.
 * - Checks `items.size` or `items.length` first, or consumes the iterable and counts its iterations.
 */
export function hasIterations(items: Iterable<unknown>): boolean {
	for (const unused of items) return true; // eslint-disable-line @typescript-eslint/no-unused-vars
	return false;
}

/**
 * Yield a range of numbers from `start` to `end`
 * - Yields in descending order if `end` is lower than `start`
 */
export function* yieldRange(start: number, end: number): Generator<number, void, void> {
	if (start <= end) for (let num = start; num <= end; num++) yield num;
	else for (let num = start; num >= end; num--) yield num;
}

/**
 * Apply a limit to an iterable set of items.
 * - Checks `items.size` or `items.length` first to see if the limit is necessary.
 */
export function limitItems<T>(items: Iterable<T>, limit: number): TypedIterable<T, void, void> {
	const size = getKnownSize(items) ?? Infinity;
	return size <= limit ? items : yieldUntilLimit(items, limit);
}

/**
 * Reduce an iterable set of items using a reducer function.
 */
export function reduceItems<T, R>(items: Iterable<T>, reducer: (previous: R, item: T) => R, initial: R): R;
export function reduceItems<T, R>(items: Iterable<T>, reducer: (previous: R | undefined, item: T) => R, initial?: R): R | undefined;
export function reduceItems<T, R>(items: Iterable<T>, reducer: (previous: R | undefined, item: T) => R, initial?: R): R | undefined {
	let current = initial;
	for (const item of items) current = reducer(current, item);
	return current;
}

/** Yield items from a source iterable until we hit a maximum iteration count. */
export function* yieldUntilLimit<T>(source: Iterable<T>, limit: number): Generator<T, void, void> {
	const iterator = source[Symbol.iterator]();
	let count = 0;
	while (true) {
		count++;
		if (count > limit) break;
		const next = iterator.next();
		if (next.done) break;
		yield next.value;
	}
}

/** Infinite iterator that yields the result of calling a function with a given set of arguments. */
export function* yieldCall<T, A extends Arguments>(func: (...a: A) => T | typeof DONE, ...args: A): Generator<T, void, void> {
	while (true) {
		const result = func(...args);
		if (result === DONE) break;
		yield result;
	}
}

/** Yield the keys of an iterable set of entries. */
export function* yieldKeys(input: Iterable<Entry>): Generator<string, void, void> {
	for (const [k] of input) yield k;
}

/** Yield the values of an iterable set of entries. */
export function* yieldValues<T>(input: Iterable<Entry<T>>): Generator<T, void, void> {
	for (const [, v] of input) yield v;
}

/** Yield chunks of a given size. */
export function* yieldChunks<T>(input: Iterable<T>, size: number): Generator<ImmutableArray<T>, void, void> {
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
export function* yieldMerged<T>(...inputs: [Iterable<T>, Iterable<T>, ...Iterable<T>[]]): Generator<T, void, void> {
	for (const input of inputs) for (const item of input) yield item;
}

/** Infinite iterator that yields every X milliseconds (yields a count of the number of iterations). */
export async function* yieldDelay(ms: number): AsyncGenerator<number, void, void> {
	let count = 1;
	while (true) {
		await new Delay(ms);
		yield count++;
	}
}

/** Infinite iterator that yields until a DONE signal is received. */
export async function* yieldUntilSignal<T>(source: AsyncIterable<T>, ...signals: [Promise<typeof DONE>, ...Promise<typeof DONE>[]]): AsyncGenerator<T, void, void> {
	const iterator = source[Symbol.asyncIterator]();
	while (true) {
		const result = await Promise.race([iterator.next(), ...signals]);
		if (result === DONE || result.done) break;
		yield result.value;
	}
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
 * 	const returned = new ReturnIterator(iterable);
 * 	for (const next of capture) console.log("YIELDED", next);
 * 	console.log("RETURNED", returned.value);
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
