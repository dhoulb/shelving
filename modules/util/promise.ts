import { Arguments } from ".";

/** Extension of `Promise` that exposes its `resolve()` and `reject()` function as public parameters. */
export class ResolvablePromise<T> extends Promise<T> {
	readonly resolve: (resolved: T) => void;
	readonly reject: (error: unknown) => void;
	constructor(initiator?: (resolve: (resolved: T) => void, reject: (error: unknown) => void) => void) {
		let thisResolve: (resolved: T) => void;
		let thisReject: (error: unknown) => void;
		super((resolve, reject) => {
			thisResolve = resolve;
			thisReject = reject;
			if (initiator) initiator(resolve, reject);
		});
		this.resolve = thisResolve!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		this.reject = thisReject!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}
}

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
