import type { ImmutableArray } from "./array.js";
import type { EntryObject } from "./entry.js";
import type { DeepPartial } from "./object.js";
import { ValueError } from "../error/ValueError.js";
import { isIterable } from "./iterate.js";
import { isObject, isPlainObject } from "./object.js";

/** Data object. */
export type Data = { readonly [K in string]: unknown };

/** Key for a data object prop. */
export type DataKey<T extends Data> = keyof T & string;

/** Value for a data object prop. */
export type DataValue<T extends Data> = T[keyof T & string];

/** Prop for a data object. */
export type DataProp<T extends Data> = {
	readonly [K in DataKey<T>]: readonly [K, T[K]];
}[DataKey<T>];

/** Database is a set of named data objects. */
export type Database = { readonly [K in string]: Data };

/**
 * Flattened data object with every branch node of the data, flattened into `a.c.b` format.
 * - Includes all branches, i.e. `{ a: { a2: number } }` will be `{ "a": object, "a.a2": number }`
 */
export type BranchData<T extends Data> = EntryObject<BranchProp<T>>;

/** Key for a flattened data object with deep keys flattened into `a.c.b` format. */
export type BranchKey<T extends Data> = BranchProp<T>[0];

/** Value for a flattened data object with deep keys flattened into `a.c.b` format. */
export type BranchValue<T extends Data> = BranchProp<T>[1];

/** Prop for a flattened data object with deep keys flattened into `a.c.b` format. */
export type BranchProp<T extends Data> = {
	readonly [K in DataKey<T>]: (
		T[K] extends Data
			? readonly [null, T[K]] | BranchProp<T[K]> //
			: readonly [null, T[K]]
	) extends infer E
		? E extends readonly [infer KK, infer VV]
			? readonly [KK extends string ? `${K}.${KK}` : K, VV]
			: never
		: never;
}[DataKey<T>];

/**
 * Flattened data object with only leaf nodes of the data, flattened into `a.c.b` format.
 * - Only include leaf nodes, i.e. `{ a: { a2: number } }` will be `{ "a.a2": number }`
 */
export type LeafData<T extends Data> = EntryObject<LeafProp<T>>;

/** Key for a flattened data object with deep keys flattened into `a.c.b` format. */
export type LeafKey<T extends Data> = LeafProp<T>[0];

/** Value for a flattened data object with deep keys flattened into `a.c.b` format. */
export type LeafValue<T extends Data> = LeafProp<T>[1];

/** Prop for a flattened data object with deep keys flattened into `a.c.b` format. */
export type LeafProp<T extends Data> = {
	readonly [K in DataKey<T>]: (
		T[K] extends Data
			? LeafProp<T[K]> //
			: readonly [null, T[K]]
	) extends infer E
		? E extends readonly [infer KK, infer VV]
			? readonly [KK extends string ? `${K}.${KK}` : K, VV]
			: never
		: never;
}[DataKey<T>];

/** Is an unknown value a data object? */
export function isData(value: unknown): value is Data {
	return isPlainObject(value);
}

/** Assert that an unknown value is a data object. */
export function assertData(value: unknown): asserts value is Data {
	if (!isPlainObject(value)) throw new ValueError("Must be data", value);
}

/** Is an unknown value the key for an own prop of a data object. */
export const isDataProp = <T extends Data>(data: T, key: unknown): key is DataKey<T> => typeof key === "string" && Object.hasOwn(data, key);

/** Assert that an unknown value is the key for an own prop of a data object. */
export function assertDataProp<T extends Data>(data: T, key: unknown): asserts key is DataKey<T> {
	if (!isDataProp(data, key)) throw new ValueError("Must be data prop", key);
}

/** Convert a data object or set of `DataProp` props for that object back into the full object. */
export function getData<T extends Data>(input: T): T;
export function getData<T extends Data>(input: T | Iterable<DataProp<T>>): Partial<T>;
export function getData<T extends Data>(input: T | Iterable<DataProp<T>>): Partial<T> {
	return isIterable(input) ? (Object.fromEntries(input) as Partial<T>) : input;
}

/** Get the props of a data object as a set of entries. */
export function getDataProps<T extends Data>(data: T): ImmutableArray<DataProp<T>>;
export function getDataProps<T extends Data>(data: T | Partial<T>): ImmutableArray<DataProp<T>>;
export function getDataProps(data: Data | Partial<Data>): ImmutableArray<DataProp<Data>> {
	return Object.entries(data);
}

/** Get the props of a data object as a set of entries. */
export function getDataKeys<T extends Data>(data: T): ImmutableArray<DataKey<T>>;
export function getDataKeys<T extends Data>(data: T | Partial<T>): ImmutableArray<DataKey<T>>;
export function getDataKeys(data: Data | Partial<Data>): ImmutableArray<DataKey<Data>> {
	return Object.keys(data);
}

/** Get a (possibly deep) prop from a data object. */
export function getDataProp<T extends Data, K extends BranchKey<T>>(data: T, key: K): BranchData<T>[K];
export function getDataProp<T extends Data, K extends BranchKey<T>>(data: DeepPartial<T>, key: K): BranchData<T>[K] | undefined;
export function getDataProp(data: Data, key: string): unknown;
export function getDataProp(data: Data, key: string): unknown {
	let current: unknown = data;
	for (const k of key.split(".")) {
		if (!isObject(current)) return undefined;
		current = current[k];
	}
	return current;
}

/** Type that represents an empty data object. */
export type EmptyData = { readonly [K in never]: never };

/** An empty object. */
export const EMPTY_DATA: EmptyData = { __proto__: null };

/** Function that returns an an empty object. */
export const getEmptyData = (): EmptyData => EMPTY_DATA;
