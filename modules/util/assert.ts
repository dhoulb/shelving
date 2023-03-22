import { AssertionError } from "../error/AssertionError.js";

/** Assert a boolean condition is true. */
export function assert(condition: unknown, ...received: unknown[]): asserts condition {
	if (!condition) throw new AssertionError(`Must assert`, ...received);
}

/** Assert two values are equal. */
export function assertEqual<T>(left: T | unknown, right: T): asserts left is T {
	if (left !== right) throw new AssertionError(`Must be equal`, left, right);
}

/** Assert two values are equal. */
export function assertNot<T, N>(left: T | N, right: N): asserts left is T {
	if (left === right) throw new AssertionError(`Must not be equal`, left, right);
}
