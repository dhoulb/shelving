import { AssertionError } from "../error/AssertionError.js";
import type { ImmutableArray } from "./array.js";
import type { ValueCallback } from "./callback.js";
import type { Report } from "./error.js";

/** Is a value an asynchronous value implementing a `then()` function. */
export function isAsync<T>(value: PromiseLike<T> | T): value is PromiseLike<T> {
	return typeof value === "object" && value !== null && typeof (value as Promise<T>).then === "function";
}

/** Is a value a synchronous value. */
export function notAsync<T>(value: PromiseLike<T> | T): value is T {
	return !isAsync(value);
}

/**
 * Throw the value if it's an async (promised) value.
 * @returns Synchronous (not promised) value.
 * @throws Promise if value is an asynchronous (promised) value.
 */
export function throwAsync<T>(value: PromiseLike<T> | T): T {
	if (isAsync(value)) throw value;
	return value;
}

/** Assert an unknown value is synchronous (i.e. does not have a `.then()` method). */
export function assertNotAsync<T>(value: PromiseLike<T> | T): asserts value is T {
	if (isAsync(value)) throw new AssertionError("Must be synchronous", { received: value, caller: assertNotAsync });
}

/** Assert an unknown value is asynchronous (i.e. has a `.then()` method). */
export function assertAsync<T>(value: PromiseLike<T> | T): asserts value is PromiseLike<T> {
	if (!isAsync(value)) throw new AssertionError("Must be asynchronous", { received: value, caller: assertAsync });
}

/** Assert that an unknown value is a `Promise` */
export function assertPromise<T>(value: Promise<T> | T): asserts value is Promise<T> {
	if (!(value instanceof Promise)) throw new AssertionError("Must be promise", { received: value, caller: assertPromise });
}

/** Run any queued microtasks now. */
export function runMicrotasks(): Promise<void> {
	// Timeouts are part of the main event queue, and events in the main queue are run _after_ all microtasks complete.
	return new Promise(resolve => setTimeout(resolve));
}

/**
 * Get the result of multiple promises concurrently.
 *
 * DH: An issue with `Promise.all()` is: if _one_ of its promises rejects, the parent promise rejects immediately.
 * - This leaves all of the other promises lost in unhandled purgatory.
 * - The program may then have dangling open threads that prevent the program from exiting, even after it has returned its main result.
 * - This function waits for the resolution of *all* promises before rejecting.
 *
 * @param promises Promises that we need to wait for.
 * @throws unknown Rethrows the first error found after resolving all the promises (the first in the _list_, not the first overall).
 */
export async function getConcurrent<T extends ImmutableArray<unknown>>(...promises: T): Promise<{ readonly [P in keyof T]: Awaited<T[P]> }>;
export async function getConcurrent(...promises: PromiseLike<unknown>[]): Promise<ImmutableArray<unknown>> {
	return (await Promise.allSettled(promises)).map(_getFulfilledResult);
}
function _getFulfilledResult<T>(result: PromiseSettledResult<T>): T {
	if (result.status === "rejected") throw result.reason;
	return result.value;
}

/** Type of `Promise` with `._resolve()` and `._reject()` methods available. */
export abstract class AbstractPromise<T> extends Promise<T> {
	// Make `this.then()` create a `Promise` not a `Deferred`
	// Done with a getter because some implementations implement this with a getter and we need to override it.
	static override get [Symbol.species]() {
		return Promise;
	}
	/** Resolve this promise with a value. */
	protected readonly _resolve: ValueCallback<T>;
	/** Reject this promise with a reason. */
	protected readonly _reject: Report;
	constructor() {
		let _resolve: ValueCallback<T>;
		let _reject: Report;
		super((x, y) => {
			_resolve = x;
			_reject = y;
		});
		// biome-ignore lint/style/noNonNullAssertion: This is set inside the executor callback.
		this._resolve = _resolve!;
		// biome-ignore lint/style/noNonNullAssertion: This is set inside the executor callback.
		this._reject = _reject!;
	}
}

/** Deferred allows you to access the internal resolve/reject callbacks of a `Promise` */
export type Deferred<T> = {
	promise: Promise<T>;
	resolve: ValueCallback<T>;
	reject: Report;
};

/**
 * Get a deferred to access the `resolve()` and `reject()` functions of a promise.
 * - See https://github.com/tc39/proposal-promise-with-resolvers/
 */
export function getDeferred<T = unknown>(): Deferred<T> {
	let resolve: ValueCallback<T>;
	let reject: Report;
	return {
		promise: new Promise<T>((x, y) => {
			resolve = x;
			reject = y;
		}),
		// biome-ignore lint/style/noNonNullAssertion: This is set inside the executor callback.
		resolve: resolve!,
		// biome-ignore lint/style/noNonNullAssertion: This is set inside the executor callback.
		reject: reject!,
	};
}

/** Get a promise that automatically resolves after a delay. */
export function getDelay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
