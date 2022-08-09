import { AssertionError } from "../error/AssertionError.js";
import type { Dispatch } from "./function.js";
import type { Handler } from "./error.js";

/** Is a value an asynchronous value implementing a `then()` function. */
export const isAsync = <T>(v: PromiseLike<T> | T): v is PromiseLike<T> => typeof v === "object" && v !== null && typeof (v as Promise<T>).then === "function";

/** Is a value a synchronous value. */
export const notAsync = <T>(v: PromiseLike<T> | T): v is T => !isAsync(v);

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

/** Type of `Promise` with its `resolve()` and `reject()` methods exposed publicly. */
export class Deferred<T> extends Promise<T> {
	// Make `this.then()` create a `Promise` not a `Deferred`
	// Done with a getter because some implementations implement this with a getter and we need to override it.
	static override get [Symbol.species]() {
		return Promise;
	}
	readonly resolve: Dispatch<[T]>;
	readonly reject: Handler;
	constructor() {
		let _resolve: Dispatch<[T]>;
		let _reject: Handler;
		super((x, y) => {
			_resolve = x;
			_reject = y;
		});
		this.resolve = _resolve!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		this.reject = _reject!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}
}

/** Type of `Promise` with `._resolve()` and `._reject()` methods available. */
export abstract class AbstractPromise<T> extends Promise<T> {
	// Make `this.then()` create a `Promise` not a `Deferred`
	// Done with a getter because some implementations implement this with a getter and we need to override it.
	static override get [Symbol.species]() {
		return Promise;
	}
	protected readonly _resolve: Dispatch<[T]>;
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

/** Promise that resolves after a specified delay in milliseconds. */
export class Delay extends AbstractPromise<void> {
	constructor(ms: number) {
		super();
		setTimeout(this._resolve, ms);
	}
}

/** The `SIGNAL` symbol indicates a signal. */
export const SIGNAL: unique symbol = Symbol("shelving/SIGNAL");

/** Resolve to `SIGNAL` on a specific signal. */
export class Signal extends AbstractPromise<typeof SIGNAL> {
	/** Send this signal now. */
	send() {
		this._resolve(SIGNAL);
	}
}

/** Infinite iterator that yields until a `SIGNAL` is received. */
export async function* yieldUntilSignal<T>(source: AsyncIterable<T>, ...signals: [Promise<typeof SIGNAL>, ...Promise<typeof SIGNAL>[]]): AsyncIterable<T> {
	const iterator = source[Symbol.asyncIterator]();
	while (true) {
		const result = await Promise.race([iterator.next(), ...signals]);
		if (result === SIGNAL || result.done) break;
		yield result.value;
	}
}
