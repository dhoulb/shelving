import { Errors } from "../error/Errors.js";
import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import { BLACKHOLE, type ErrorCallback, type ValueCallback } from "./function.js";

/**
 * Is a value an asynchronous value implementing a `then()` function.
 *
 * @param value The value to test.
 * @returns `true` if `value` is a `PromiseLike`, narrowing its type.
 * @see https://dhoulb.github.io/shelving/util/async/isAsync
 */
export function isAsync<T>(value: PromiseLike<T> | T): value is PromiseLike<T> {
	return typeof value === "object" && value !== null && typeof (value as Promise<T>).then === "function";
}

/**
 * Is a value a synchronous value.
 *
 * @param value The value to test.
 * @returns `true` if `value` is not a `PromiseLike`, narrowing its type.
 * @see https://dhoulb.github.io/shelving/util/async/notAsync
 */
export function notAsync<T>(value: PromiseLike<T> | T): value is T {
	return !isAsync(value);
}

/**
 * Throw the value if it's an async (promised) value.
 *
 * @param value The value to unwrap.
 * @returns Synchronous (not promised) value.
 * @throws Promise if value is an asynchronous (promised) value.
 * @example throwAsync(123) // 123
 * @see https://dhoulb.github.io/shelving/util/async/throwAsync
 */
export function throwAsync<T>(value: PromiseLike<T> | T): T {
	if (isAsync(value)) throw value;
	return value;
}

/**
 * Assert an unknown value is synchronous (i.e. does not have a `.then()` method).
 *
 * @param value The value to assert.
 * @throws {RequiredError} If `value` is a `PromiseLike`.
 * @example assertNotAsync(123); // passes
 * @see https://dhoulb.github.io/shelving/util/async/assertNotAsync
 */
export function assertNotAsync<T>(value: PromiseLike<T> | T): asserts value is T {
	if (isAsync(value)) throw new RequiredError("Must be synchronous", { received: value, caller: assertNotAsync });
}

/**
 * Assert an unknown value is asynchronous (i.e. has a `.then()` method).
 *
 * @param value The value to assert.
 * @throws {RequiredError} If `value` is not a `PromiseLike`.
 * @example assertAsync(Promise.resolve(1)); // passes
 * @see https://dhoulb.github.io/shelving/util/async/assertAsync
 */
export function assertAsync<T>(value: PromiseLike<T> | T): asserts value is PromiseLike<T> {
	if (!isAsync(value)) throw new RequiredError("Must be asynchronous", { received: value, caller: assertAsync });
}

/**
 * Assert that an unknown value is a `Promise`.
 *
 * @param value The value to assert.
 * @throws {RequiredError} If `value` is not a `Promise` instance.
 * @example assertPromise(Promise.resolve(1)); // passes
 * @see https://dhoulb.github.io/shelving/util/async/assertPromise
 */
export function assertPromise<T>(value: Promise<T> | T): asserts value is Promise<T> {
	if (!(value instanceof Promise)) throw new RequiredError("Must be promise", { received: value, caller: assertPromise });
}

/**
 * Run any queued microtasks now.
 *
 * @returns A promise that resolves after all currently-queued microtasks have run.
 * @example await runMicrotasks();
 * @see https://dhoulb.github.io/shelving/util/async/runMicrotasks
 */
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
 * @param promises Values (usually async, but not necessarily) that we need to wait for.
 * @returns Array of values of all promises (in the same order/positions as input).
 * @throws {Errors} If one or more promises throws all rejection reasons after resolving all of the promises.
 * @example const [a, b] = await awaitValues(getA(), getB());
 * @see https://dhoulb.github.io/shelving/util/async/awaitValues
 */
export async function awaitValues<T extends ImmutableArray<unknown>>(...promises: T): Promise<{ readonly [P in keyof T]: Awaited<T[P]> }>;
export async function awaitValues(...promises: unknown[]): Promise<ImmutableArray<unknown>> {
	const values: unknown[] = [];
	const errors: unknown[] = [];
	for (const result of await Promise.allSettled(promises)) {
		if (result.status === "rejected") errors.push(result.reason);
		else values.push(result.value);
	}
	if (errors.length) throw new Errors(errors, "Concurrent promise rejections", { caller: awaitValues });
	return values;
}

/**
 * Get the rejection reasons of multiple promises (concurrently).
 *
 * @param promises Values (usually async, but not necessarily) that we need to wait for.
 * @returns Array of rejection reasons of all promises (or empty array if no promises threw).
 * @example const errors = await awaitErrors(getA(), getB());
 * @see https://dhoulb.github.io/shelving/util/async/awaitErrors
 */
export async function awaitErrors(...promises: PromiseLike<unknown>[]): Promise<ImmutableArray<unknown>> {
	const errors: unknown[] = [];
	for (const result of await Promise.allSettled(promises)) if (result.status === "rejected") errors.push(result.reason);
	return errors;
}

/**
 * `Promise` designed for extending with `._resolve()` and `._reject()` methods that can be accessed by subclasses.
 *
 * @example
 * class MyPromise extends BasePromise<number> {
 * 	done() { this._resolve(123); }
 * }
 * @see https://dhoulb.github.io/shelving/util/async/BasePromise
 */
export abstract class BasePromise<T> extends Promise<T> {
	// Make `this.then()` create a `Promise` not a `Deferred`
	// Done with a getter because some implementations implement this with a getter and we need to override it.
	static override get [Symbol.species]() {
		return Promise;
	}
	/** Resolve this promise with a value. */
	protected readonly _resolve: ValueCallback<T>;
	/** Reject this promise with a reason. */
	protected readonly _reject: ErrorCallback;
	constructor() {
		let _resolve: ValueCallback<T>;
		let _reject: ErrorCallback;
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

/**
 * Deferred allows you to access the internal resolve/reject callbacks of a `Promise`.
 *
 * @see https://dhoulb.github.io/shelving/util/async/Deferred
 */
export type Deferred<T = unknown> = {
	promise: Promise<T>;
	resolve: ValueCallback<T>;
	reject: ErrorCallback;
};

/**
 * Create a deferred to access the `resolve()` and `reject()` functions of a promise.
 * - See https://github.com/tc39/proposal-promise-with-resolvers/
 *
 * @returns A `Deferred` exposing the promise and its `resolve()`/`reject()` functions.
 * @example const { promise, resolve } = createDeferred<number>();
 * @see https://dhoulb.github.io/shelving/util/async/createDeferred
 */
export function createDeferred<T = void>(): Deferred<T> {
	let resolve: ValueCallback<T>;
	let reject: ErrorCallback;
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

/**
 * Get a promise that automatically resolves after a delay.
 *
 * @param ms The delay in milliseconds before the promise resolves.
 * @returns A promise that resolves with `undefined` after `ms` milliseconds.
 * @example await getDelay(300); // resolves after 300ms
 * @see https://dhoulb.github.io/shelving/util/async/getDelay
 */
export function getDelay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get a promise that rejects with the signal's reason when an `AbortSignal` fires.
 * - Rejects immediately if the signal is already aborted.
 * - Use with `awaitRace()` to cancel a concurrent operation when a signal fires.
 *
 * @param signal The `AbortSignal` to watch.
 * @returns A promise that never resolves and rejects with the signal's reason when it fires.
 * @throws The signal's `reason` when the signal aborts.
 * @example await awaitRace(getDelay(300), awaitAbort(signal));
 * @see https://dhoulb.github.io/shelving/util/async/awaitAbort
 */
export function awaitAbort(signal: AbortSignal): Promise<never> {
	const promise = new Promise<never>((_, reject) => {
		if (signal.aborted) reject(signal.reason);
		else signal.addEventListener("abort", () => reject(signal.reason), { once: true });
	});
	promise.catch(BLACKHOLE);
	return promise;
}

/**
 * Race promises like `Promise.race()` but silently swallow rejections from the losers.
 * - Returns a promise that settles with the first input to settle, exactly like `Promise.race()`.
 * - The losing inputs keep running (Promises cannot be cancelled), but their eventual rejection — if any — is silently absorbed instead of bubbling up as an unhandled rejection.
 * - Built for cancellation/timeout patterns, where the loser's eventual fate is genuinely uninteresting once another arm has settled. Do not use when both arms might surface meaningful errors that the caller should see.
 *
 * @param promises The promises to race against each other.
 * @returns A promise that settles with the first input to settle.
 * @throws The rejection reason of the first input to settle, if it rejects.
 * @example await awaitRace(getDelay(300), awaitAbort(signal)); // delay or abort, no leaked ABORT rejection if delay wins
 * @see https://dhoulb.github.io/shelving/util/async/awaitRace
 */
export function awaitRace<T>(...promises: Promise<T>[]): Promise<T> {
	for (const promise of promises) promise.catch(BLACKHOLE);
	return Promise.race(promises);
}
