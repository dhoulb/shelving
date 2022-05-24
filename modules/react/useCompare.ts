import { useRef } from "react";
import type { Arguments } from "../util/function.js";

/** Use a memoised value with custom comparison logic. */
export function useCompare<T, A extends Arguments = []>(compare: (left: T, right: T, ...a: A) => boolean, value: T, ...args: A): T {
	const ref = useRef<T>(value);
	if (!compare(value, ref.current, ...args)) ref.current = value;
	return ref.current;
}
