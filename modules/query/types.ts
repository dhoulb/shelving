import type { ArrayType, ImmutableArray } from "../array";
import type { Data } from "../data";

/** Interface to make sure an object implements all matchers. */
export interface Filterable<T extends Data> {
	// These methods allow any plain value (e.g. numbers, strings, booleans, null).
	is<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this;
	not<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this;
	in<K extends "id" | keyof T>(key: K, value: K extends "id" ? readonly string[] : readonly T[K][]): this;
	// These methods allow ordered values only (e.g. numbers, strings).
	lt<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this;
	lte<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this;
	gt<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this;
	gte<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this;
	// These methods allow array of plain values only (e.g. arrays of numbers, strings, booleans, null).
	contains<K extends keyof T>(key: K, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this;
}

/** Interface to make sure an object implements all directions. */
export interface Sortable<T extends Data> {
	asc(key?: "id" | keyof T): this;
	desc(key?: "id" | keyof T): this;
}

/** Interface to make sure an object implements all slicers. */
export interface Sliceable {
	limit(limit: number | null): this;
}

/** Interface that combines Filterable, Sortable, Sliceable. */
export interface Queryable<T extends Data> extends Filterable<T>, Sortable<T>, Sliceable {}
