import { useRef } from "react";
import type { Arguments } from "../util/function.js";

/** Use memoised value with reduction logic. */
export function useReduce<T, A extends Arguments = []>(reduce: (previous: T | undefined, ...a: A) => T, ...args: A): T {
	const r = useRef<T>();
	r.current = reduce(r.current, ...args);
	return r.current;
}
