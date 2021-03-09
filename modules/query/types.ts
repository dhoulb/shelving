import type { ArrayType, ImmutableArray } from "../array";
import type { Data } from "../data";

/** Interface to make sure an object implements all matchers. */
export interface Filterable<T extends Data> {
	is<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this;
	not<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this;
	in<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? readonly string[] : readonly T[K][]): this;
	lt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this;
	lte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this;
	gt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this;
	gte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this;
	contains<K extends keyof T>(key: K & string, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this;
}

/** Interface to make sure an object implements all directions. */
export interface Sortable<T extends Data> {
	asc(key?: "id" | (keyof T & string)): this;
	desc(key?: "id" | (keyof T & string)): this;
}

/** Interface to make sure an object implements all slicers. */
export interface Sliceable {
	limit(limit: number | null): this;
}

/** Interface that combines Filterable, Sortable, Sliceable. */
export interface Queryable<T extends Data> extends Filterable<T>, Sortable<T>, Sliceable {
	// These methods combine sorting and filtering to provide offsetting.
	after(id: string, data: T): this;
	before(id: string, data: T): this;
}
