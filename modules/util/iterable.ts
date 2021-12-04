import type { Mutable } from "./data.js";
import type { ImmutableMap } from "./map.js";
import type { ImmutableArray } from "./array.js";
import type { Entry } from "./entry.js";

/** `Iterable` interface that specifies a return type for the iterator. */
export interface TypedIterable<T, R, N> {
	[Symbol.iterator](): Iterator<T, R, N>;
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
export function* yieldRange(start: number, end: number): Generator<number, void, void> {
	if (start <= end) for (let num = start; num <= end; num++) yield num;
	else for (let num = start; num >= end; num--) yield num;
}

/**
 * Apply a limit to an iterable set of items.
 * - Checks `items.size` or `items.length` first to see if the limit is necessary.
 */
export function limitItems<T>(items: Iterable<T>, limit: number): TypedIterable<T, void, void> {
	const size = getSize(items) ?? Infinity;
	return size <= limit ? items : limitIterations(items, limit);
}

/**
 * Limit the number of iterations an iterable does.
 */
export function* limitIterations<T>(items: Iterable<T>, limit: number): Generator<T, void, void> {
	let count = 0;
	for (const item of items) {
		if (++count <= limit) yield item;
		else break;
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

/** Abstract iterator designed to be extended that implements the full iterator/generator protocol. */
export abstract class AbstractIterator<T, R, N = void> implements Generator<T, R, N> {
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
export abstract class ThroughIterator<T, R, N = void> extends AbstractIterator<T, R, N> {
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
export class WatchIterator<T, R, N = void> extends ThroughIterator<T, R, N> {
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
