import { useRef } from "react";

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/** Create an object that persist for the lifetime of the component. */
export function useProps<T>(): Partial<Mutable<T>> {
	return useRef(undefined) as unknown as Partial<Mutable<T>>;
}
