import type { Dispatcher, Catcher } from "./dispatch";

/** Extension of `Promise` that exposes its `resolve()` and `reject()` function as public parameters. */
export class ResolvablePromise<T> extends Promise<T> {
	readonly resolve: Dispatcher<T>;
	readonly reject: Catcher;
	constructor(initiator?: (resolve: Dispatcher<T>, reject: Catcher) => void) {
		let thisResolve: Dispatcher<T>;
		let thisReject: Catcher;
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
export function throwAsync<T>(asyncValue: T | Promise<T>): T {
	if (isAsync(asyncValue)) throw asyncValue;
	return asyncValue;
}

/** Is a value an async (promised) value. */
export const isAsync = <T>(v: T | PromiseLike<T>): v is PromiseLike<T> =>
	v instanceof Promise || (typeof v === "object" && v !== null && typeof (v as Promise<T>).then === "function");
