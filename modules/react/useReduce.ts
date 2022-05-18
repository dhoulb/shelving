import { useRef } from "react";
import { Arguments } from "../util/index.js";

/** Use memoised value with reduction logic. */
export function useReduce<T, A extends Arguments = []>(reduce: (previous: T | undefined, ...a: A) => T | undefined, ...args: A): T | undefined;
export function useReduce<T, A extends Arguments = []>(reduce: (previous: T | undefined, ...a: A) => T, ...args: A): T;
export function useReduce<T, A extends Arguments = []>(reduce: (previous: T | undefined, ...a: A) => T, ...args: A): T {
	const r = useRef<T | undefined>();
	r.current = reduce(r.current, ...args);
	return r.current;
}
