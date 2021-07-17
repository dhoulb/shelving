import type { Mutable } from "./object";

/** Extension of `Promise` that exposes its `resolve()` and `reject()` function as public parameters. */
export class ResolvablePromise<T> extends Promise<T> {
	readonly resolve!: (value: T) => void;
	readonly reject!: (error: Error | unknown) => void;
	constructor(initiator?: (resolve: (value: T) => void, reject: (error: Error | unknown) => void) => void) {
		super((resolve, reject) => {
			(this as Mutable<this>).resolve = resolve;
			(this as Mutable<this>).reject = reject;
			if (initiator) initiator(resolve, reject);
		});
	}
}

/**
 * Throw the value if it's an async (promised) value.
 * @returns Synchronous (not promised) value.
 * @throws Promise if value is an asynchronous (promised) value.
 */
export function throwAsync<T>(asyncValue: T | Promise<T>): T {
	if (isAsync(asyncValue)) throw asyncValue;
	return asyncValue;
}

/** Is a value an async (promised) value. */
export const isAsync = <T>(v: T | PromiseLike<T>): v is PromiseLike<T> =>
	v instanceof Promise || (typeof v === "object" && v !== null && typeof (v as Promise<T>).then === "function");
