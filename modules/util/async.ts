import type { Dispatch, Handler } from "./function.js";
import { AssertionError } from "../error/AssertionError.js";
import { SIGNAL } from "./constants.js";

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
	protected readonly _resolve: Dispatch<[T]>;
	/** Reject this promise with a reason. */
	protected readonly _reject: Handler;
	constructor() {
		let _resolve: Dispatch<[T]>;
		let _reject: Handler;
		super((x, y) => {
			_resolve = x;
			_reject = y;
		});
		this._resolve = _resolve!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		this._reject = _reject!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}
}

/** Type of `Promise` with its `resolve()` and `reject()` methods exposed publicly. */
export class Deferred<T = void> extends Promise<T> {
	// Make `this.then()` create a `Promise` not a `Deferred`
	// Done with a getter because some implementations implement this with a getter and we need to override it.
	static override get [Symbol.species]() {
		return Promise;
	}
	/** Resolve this deferred with a value. */
	readonly resolve: Dispatch<[T]>;
	/** Reject this deferred with a reason. */
	readonly reject: Handler;
	constructor() {
		let resolve: Dispatch<[T]>;
		let reject: Handler;
		super((x, y) => {
			resolve = x;
			reject = y;
		});
		this.resolve = resolve!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		this.reject = reject!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}
}

/** Promise that resolves after a specified delay in milliseconds. */
export class Delay extends AbstractPromise<void> {
	constructor(ms: number) {
		super();
		setTimeout(this._resolve, ms);
	}
}

/** Resolve to `SIGNAL` on a specific signal. */
export class Signal extends AbstractPromise<typeof Signal.SIGNAL> {
	/** The `SIGNAL` symbol indicates a signal. */
	static SIGNAL: typeof SIGNAL = SIGNAL;
	/** Send this signal now. */
	readonly send = () => this._resolve(Signal.SIGNAL);
}
