import { DONE } from "./constants.js";
import { Handler } from "./error.js";
import type { Arguments, Dispatcher } from "./function.js";

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
export const callAsync = <I, O, A extends Arguments = []>(callback: (v: I, ...a: A) => O, value: I | PromiseLike<I>, ...args: A): O | PromiseLike<O> => (isAsync(value) ? _awaitCallAsync(callback, value, args) : callback(value, ...args));
export const _awaitCallAsync = async <I, O, A extends Arguments>(callback: (v: I, ...a: A) => O, value: PromiseLike<I>, args: A): Promise<O> => callback(await value, ...args);

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

/** Resolve to `DONE` after a specified delay. */
export class Timeout extends AbstractPromise<typeof DONE> {
	constructor(ms: number) {
		super();
		setTimeout(this._resolve, ms, DONE);
	}
}
