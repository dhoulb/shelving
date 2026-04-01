import type { UnionToIntersection } from "@google-cloud/firestore";
import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import type { EntryObject } from "./entry.js";
import type { AnyCaller } from "./function.js";
import { isIterable } from "./iterate.js";
import type { DeepPartial } from "./object.js";
import { isObject, isPlainObject } from "./object.js";
import type { Resolve } from "./types.js";

/** Data object. */
export type Data = { readonly [K in string]: unknown };

/** Partial data object (values can be explicitly `undefined`). */
export type PartialData<T extends Data> = { readonly [K in keyof T]?: T[K] | undefined };

/** Helper type to get the key for for a data object prop. */
export type DataKey<T extends Data> = keyof T & string;

/** Helper type to get the value for a data object prop. */
export type DataValue<T extends Data> = T[DataKey<T>];

/**
 * Helper type to get a prop for a data object.
 * i.e. `DataProp<{ a: number }>` produces `readonly ["a", number"]`
 */
export type DataProp<T extends Data> = {
	readonly [K in DataKey<T>]: readonly [K, T[K]];
}[DataKey<T>];

/**
 * Helper type to get a flattened data object with every branch node of the data, flattened into `a.c.b` format.
 * i.e. `BranchData<{ a: { a2: number } }>` produces `{ "a": object, "a.a2": number }`
 */
export type BranchData<T extends Data> = EntryObject<BranchProp<T>>;

/** Helper type to get the key for a flattened data object with deep keys flattened into `a.c.b` format. */
export type BranchKey<T extends Data> = BranchProp<T>[0];

/** Helper type to get the value for a flattened data object with deep keys flattened into `a.c.b` format. */
export type BranchValue<T extends Data> = BranchProp<T>[1];

/** Helper type to get the prop for a flattened data object with deep keys flattened into `a.c.b` format. */
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
 * Helper type to get a flattened data object with only leaf nodes of the data, flattened into `a.c.b` format.
 * i.e. `LeafData<{ a: { a2: number } }>` produces `{ "a.a2": number }`
 */
export type LeafData<T extends Data> = EntryObject<LeafProp<T>>;

/** Helper type to get the leaf keys for a flattened data object with deep keys flattened into `a.c.b` format. */
export type LeafKey<T extends Data> = LeafProp<T>[0];

/** Helper type to get the leaf values for a flattened data object with deep keys flattened into `a.c.b` format. */
export type LeafValue<T extends Data> = LeafProp<T>[1];

/** Helper type to get the leaf props for a flattened data object with deep keys flattened into `a.c.b` format. */
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

/**
 * Object with one level of data nested beneath each prop.
 * i.e. `{ A: { a: number }, B: { b: string } }`
 */
export type NestedData = { readonly [key: string]: Data };

/**
 * Helper type to flatten one level of nested data into a single flat `Data` type.
 * i.e. `FlattenData<{ A: { a: number }, B: { b: string } }>` produces `{ a: number, b: string }`
 */
export type FlatData<T extends NestedData> = Resolve<UnionToIntersection<T[keyof T]>>;

/** Is an unknown value a data object? */
export function isData(value: unknown): value is Data {
	return isPlainObject(value);
}

/** Assert that an unknown value is a data object. */
export function assertData(value: unknown, caller: AnyCaller = assertData): asserts value is Data {
	if (!isPlainObject(value)) throw new RequiredError("Must be data object", { received: value, caller });
}

/** Convert a data object or set of `DataProp` props for that object back into the full object. */
export function getData<T extends Data>(input: T): T;
export function getData<T extends Data>(input: T | Iterable<DataProp<T>>): Partial<T>;
export function getData<T extends Data>(input: T | Iterable<DataProp<T>>): Partial<T> {
	return isIterable(input) ? (Object.fromEntries(input) as Partial<T>) : input;
}

/** Is an unknown value the key for an own prop of a data object. */
export const isDataProp = <T extends Data>(data: T, key: unknown): key is DataKey<T> => typeof key === "string" && Object.hasOwn(data, key);

/** Assert that an unknown value is the key for an own prop of a data object. */
export function assertDataProp<T extends Data>(data: T, key: unknown, caller: AnyCaller = assertDataProp): asserts key is DataKey<T> {
	if (!isDataProp(data, key)) throw new RequiredError("Key must exist in data object", { key, data, caller });
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

/** Get an optional (possibly deep) prop from a data object, or `undefined` if it doesn't exist. */
export function getDataProp<T extends Data, K extends BranchKey<T> = BranchKey<T>>(data: T, key: K): BranchData<T>[K];
export function getDataProp<T extends Data, K extends BranchKey<T> = BranchKey<T>>(
	data: DeepPartial<T>,
	key: K,
): BranchData<T>[K] | undefined;
export function getDataProp(data: Data, key: string): unknown;
export function getDataProp(data: Data, key: string): unknown {
	let current: unknown = data;
	for (const k of key.split(".")) {
		if (!isObject(current)) return undefined;
		current = current[k];
	}
	return current;
}
