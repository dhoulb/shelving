import type { ValueCallback } from "./callback.js";
import type { Report } from "./error.js";
import { AssertionError } from "../error/AssertionError.js";

/** Is a value an asynchronous value implementing a `then()` function. */
export const isAsync = <T>(value: PromiseLike<T> | T): value is PromiseLike<T> => typeof value === "object" && value !== null && typeof (value as Promise<T>).then === "function";

/** Is a value a synchronous value. */
export const notAsync = <T>(value: PromiseLike<T> | T): value is T => !isAsync(value);

/**
 * Throw the value if it's an async (promised) value.
 * @returns Synchronous (not promised) value.
 * @throws Promise if value is an asynchronous (promised) value.
 */
export function throwAsync<T>(value: PromiseLike<T> | T): T {
	if (isAsync(value)) throw value;
	return value;
}

/** Assert a synchronous value. */
export function assertNotAsync<T>(value: PromiseLike<T> | T): asserts value is T {
	if (isAsync(value)) throw new AssertionError("Must be synchronous", value);
}

/** Assert an asynchronous value. */
export function assertAsync<T>(value: PromiseLike<T> | T): asserts value is PromiseLike<T> {
	if (!isAsync(value)) throw new AssertionError("Must be asynchronous", value);
}

/** Assert a promise. */
export function assertPromise<T>(value: Promise<T> | T): asserts value is Promise<T> {
	if (!(value instanceof Promise)) throw new AssertionError("Must be promise", value);
}

/** Run any queued microtasks now. */
export function runMicrotasks(): Promise<void> {
	// Timeouts are part of the main event queue, and events in the main queue are run _after_ all microtasks complete.
	return new Promise(resolve => setTimeout(resolve));
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
		this._resolve = _resolve!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		this._reject = _reject!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
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
		resolve: resolve!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
		reject: reject!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
	};
}

/** Get a promise that automatically resolves after a delay. */
export function getDelay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
