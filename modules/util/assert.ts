import { ValueError } from "../error/ValueError.js";

/** Assert two values are equal. */
export function assertEqual<T>(left: unknown, right: T): asserts left is T {
	if (left !== right) throw new ValueError(`Must be equal`, { left, right });
}

/** Assert two values are equal. */
export function assertNot<T, N>(left: T | N, right: N): asserts left is T {
	if (left === right) throw new ValueError(`Must not be equal`, { left, right });
}
