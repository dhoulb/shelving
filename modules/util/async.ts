import type { Dispatcher } from "./dispatch.js";
import type { Arguments } from "./function.js";

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

/** Call a function with a set of values *BUT* if the first value is asynchronous wait for it to resolve first before calling the function. */
export const callAsync = <I, O, A extends Arguments = []>(callback: (v: I, ...a: A) => O, value: I | PromiseLike<I>, ...args: A): O | PromiseLike<O> =>
	isAsync(value) ? _awaitCallAsync(callback, value, args) : callback(value, ...args);
export const _awaitCallAsync = async <I, O, A extends Arguments>(callback: (v: I, ...a: A) => O, value: PromiseLike<I>, args: A): Promise<O> =>
	callback(await value, ...args);

// Internal way for us to save `resolve()` and `reject()` from a new Promise used by `Deferred` and `ExtendablePromise`
let resolve: Dispatcher<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
let reject: Dispatcher<Error | unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveResolveReject(x: Dispatcher<any>, y: Dispatcher<Error | unknown>): void {
	resolve = x;
	reject = y;
}

/** Type of `Promise` with its `resolve()` and `reject()` methods exposed publicly. */
export class Deferred<T> extends Promise<T> {
	static override [Symbol.species] = Promise; // Make `this.then()` create a `Promise` not a `Deferred`
	readonly resolve: Dispatcher<T | PromiseLike<T>>;
	readonly reject: Dispatcher<Error | unknown | PromiseLike<Error | unknown>>;
	constructor() {
		super(saveResolveReject);
		this.resolve = resolve;
		this.reject = reject;
	}
}

/** Type of `Promise` with `._resolve()` and `._reject()` methods available. */
export abstract class AbstractPromise<T> extends Promise<T> {
	static override [Symbol.species] = Promise; // Make `this.then()` create a `Promise` not an `ExtendablePromise`
	protected readonly _resolve: Dispatcher<T | PromiseLike<T>>;
	protected readonly _reject: Dispatcher<Error | unknown>;
	constructor() {
		super(saveResolveReject);
		this._resolve = resolve;
		this._reject = reject;
	}
}
