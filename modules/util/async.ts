import type { ImmutableArray } from "./array.js";
import type { Arguments, Dispatcher } from "./function.js";
import { DONE } from "./constants.js";
import { Handler } from "./error.js";

/**
 * Throw the value if it's an async (promised) value.
 * @returns Synchronous (not promised) value.
 * @throws Promise if value is an asynchronous (promised) value.
 */
export function throwAsync<T>(asyncValue: T | PromiseLike<T>): T {
	if (isAsync(asyncValue)) throw asyncValue;
	return asyncValue;
}

/** Is a value an async (promised) value. */
export const isAsync = <T>(v: T | PromiseLike<T>): v is PromiseLike<T> => typeof v === "object" && v !== null && typeof (v as Promise<T>).then === "function";

/**
 * Call a callback with an item.
 * - If neither `callback` or `item` are async then the value returned will be synchronous.
 *
 * @param callback The sync or async function to call.
 * @param item The first argument for `callback` (if this value is async it will be awaited before `callback` is called).
 * @param ...args Additional arguments for `callback`
 */
export const callAsync = <I, O, A extends Arguments = []>(callback: (v: I, ...a: A) => O | PromiseLike<O>, item: I | PromiseLike<I>, ...args: A): O | PromiseLike<O> =>
	isAsync(item) ? _awaitCallAsync(callback, item, args) : callback(item, ...args);
export const _awaitCallAsync = async <I, O, A extends Arguments>(callback: (v: I, ...a: A) => O | PromiseLike<O>, item: PromiseLike<I>, args: A): Promise<O> => callback(await item, ...args);

/**
 * Call a callback for a set of items in series.
 *
 * @param callback The sync or async function to call for each item.
 * @param items The set of first arguments for `callback` (if this value is async it will be awaited before `callback` is called).
 * @param ...args Additional arguments for `callback`
 */
export async function callAsyncSeries<I, O, A extends Arguments = []>(callback: (item: I, ...a: A) => O | PromiseLike<O>, items: Iterable<I | PromiseLike<I>>, ...args: A): Promise<ImmutableArray<O>> {
	const outputs: O[] = [];
	for (const item of items) outputs.push(await callback(await item, ...args));
	return outputs;
}

/**
 * Call a callback for a set of items in parallel.
 *
 * @param callback The sync or async function to call for each item.
 * @param items The set of first arguments for `callback` (if this value is async it will be awaited before `callback` is called).
 * @param ...args Additional arguments for `callback`
 */
export async function callAsyncParallel<I, O, A extends Arguments = []>(callback: (item: I, ...a: A) => O | PromiseLike<O>, items: Iterable<I | PromiseLike<I>>, ...args: A): Promise<ImmutableArray<O>> {
	const outputs: (O | PromiseLike<O>)[] = [];
	for (const item of await Promise.all(items)) outputs.push(callback(item, ...args));
	return Promise.all(outputs);
}

// Internal way for us to save `resolve()` and `reject()` from a new Promise used by `Deferred` and `ExtendablePromise`
let resolve: Dispatcher<[any]>; // eslint-disable-line @typescript-eslint/no-explicit-any
let reject: Handler;
function saveResolveReject(
	x: Dispatcher<[any]>, // eslint-disable-line @typescript-eslint/no-explicit-any
	y: Handler,
): void {
	resolve = x;
	reject = y;
}

/** Type of `Promise` with its `resolve()` and `reject()` methods exposed publicly. */
export class Deferred<T> extends Promise<T> {
	// Make `this.then()` create a `Promise` not a `Deferred`
	// Done with a getter because some implementations implement this with a getter and we need to override it.
	static override get [Symbol.species]() {
		return Promise;
	}
	readonly resolve: Dispatcher<[T]>;
	readonly reject: Handler;
	constructor() {
		super(saveResolveReject);
		this.resolve = resolve;
		this.reject = reject;
	}
}

/** Type of `Promise` with `._resolve()` and `._reject()` methods available. */
export abstract class AbstractPromise<T> extends Promise<T> {
	// Make `this.then()` create a `Promise` not a `Deferred`
	// Done with a getter because some implementations implement this with a getter and we need to override it.
	static override get [Symbol.species]() {
		return Promise;
	}
	protected readonly _resolve: Dispatcher<[T]>;
	protected readonly _reject: Handler;
	constructor() {
		super(saveResolveReject);
		this._resolve = resolve;
		this._reject = reject;
	}
}

/** Promise that resolves after a specified delay in milliseconds. */
export class Delay extends AbstractPromise<void> {
	constructor(ms: number) {
		super();
		setTimeout(this._resolve, ms);
	}
}

/** Resolve to `DONE` on a specific signal. */
export class Signal extends AbstractPromise<typeof DONE> {
	/** Send this signal now. */
	done() {
		this._resolve(DONE);
	}
}
