import { AssertionError } from "../error/AssertionError.js";

/** Assert a boolean condition is true. */
export function assert(condition: unknown, ...received: unknown[]): asserts condition {
	if (!condition) throw new AssertionError(`Must assert`, ...received);
}

/** Assert two values are equal. */
export function assertEqual<T>(v: T | unknown, target: T): asserts v is T {
	if (v !== target) throw new AssertionError(`Must be equal`, v, target);
}

/** Assert two values are equal. */
export function assertNot<T, N>(v: T | N, target: N): asserts v is T {
	if (v === target) throw new AssertionError(`Must not be equal`, v, target);
}
