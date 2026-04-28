import type { UnionToIntersection } from "@google-cloud/firestore";
import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import type { EntryObject } from "./entry.js";
import type { AnyCaller } from "./function.js";
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
 * A path to a (possibly deep) property in a data object, e.g. `["sub", "str"]`.
 * - At least one path segment is required.
 */
export type DataPath = readonly [key: string, ...string[]];

/**
 * Helper type to get a flattened data object with every branch node of the data, flattened into `a.c.b` format.
 * i.e. `BranchData<{ a: { a2: number } }>` produces `{ "a": object, "a.a2": number }`
 */
export type BranchData<T extends Data> = EntryObject<BranchDataProp<T>>;

/** Helper type to get the key for a flattened data object with deep keys flattened into `a.c.b` format. */
export type BranchDataKey<T extends Data> = BranchDataProp<T>[0];

/** Helper type to get the value for a flattened data object with deep keys flattened into `a.c.b` format. */
export type BranchDataValue<T extends Data> = BranchDataProp<T>[1];

/** Helper type to get the prop for a flattened data object with deep keys flattened into `a.c.b` format. */
export type BranchDataProp<T extends Data> = {
	readonly [K in DataKey<T>]: (
		T[K] extends Data
			? readonly [null, T[K]] | BranchDataProp<T[K]> //
			: readonly [null, T[K]]
	) extends infer E
		? E extends readonly [infer KK, infer VV]
			? readonly [KK extends string ? `${K}.${KK}` : K, VV]
			: never
		: never;
}[DataKey<T>];

/**
 * Typed path tuple for every branch node of a data object (including intermediate objects).
 * i.e. `BranchPath<{ a: number, b: { c: string } }>` produces `readonly ["a"] | readonly ["b"] | readonly ["b", "c"]`
 */
export type BranchDataPath<T extends Data> = {
	readonly [K in DataKey<T>]: T[K] extends Data ? readonly [K] | readonly [K, ...BranchDataPath<T[K]>] : readonly [K];
}[DataKey<T>];

/**
 * Helper type to get a flattened data object with only leaf nodes of the data, flattened into `a.c.b` format.
 * i.e. `LeafData<{ a: { a2: number } }>` produces `{ "a.a2": number }`
 */
export type LeafData<T extends Data> = EntryObject<LeafDataProp<T>>;

/** Helper type to get the leaf keys for a flattened data object with deep keys flattened into `a.c.b` format. */
export type LeafDataKey<T extends Data> = LeafDataProp<T>[0];

/** Helper type to get the leaf values for a flattened data object with deep keys flattened into `a.c.b` format. */
export type LeafDataValue<T extends Data> = LeafDataProp<T>[1];

/** Helper type to get the leaf props for a flattened data object with deep keys flattened into `a.c.b` format. */
export type LeafDataProp<T extends Data> = {
	readonly [K in DataKey<T>]: (
		T[K] extends Data
			? LeafDataProp<T[K]> //
			: readonly [null, T[K]]
	) extends infer E
		? E extends readonly [infer KK, infer VV]
			? readonly [KK extends string ? `${K}.${KK}` : K, VV]
			: never
		: never;
}[DataKey<T>];

/**
 * Typed path tuple for only leaf nodes of a data object.
 * i.e. `LeafPath<{ a: number, b: { c: string } }>` produces `readonly ["a"] | readonly ["b", "c"]`
 */
export type LeafDataPath<T extends Data> = {
	readonly [K in DataKey<T>]: T[K] extends Data ? readonly [K, ...LeafDataPath<T[K]>] : readonly [K];
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

/**
 * Split a dotted key into a data path tuple.
 * @example splitDataKey<{ a: { b: number } }>("a.b"); // Returns `["a", "b"]`
 */
export function splitDataKey<T extends Data>(key: BranchDataKey<T>): BranchDataPath<T>;
export function splitDataKey<T extends Data>(key: LeafDataKey<T>): LeafDataPath<T>;
export function splitDataKey(key: string): DataPath;
export function splitDataKey(key: string): DataPath {
	return key.split(".") as unknown as DataPath;
}

/**
 * Join a data path tuple back into a dotted key.
 * @example joinDataKey<{ a: { b: number } }>(["a", "b"]); // Returns `"a.b"`
 */
export function joinDataKey<T extends Data>(path: BranchDataPath<T>): BranchDataKey<T>;
export function joinDataKey<T extends Data>(path: LeafDataPath<T>): LeafDataKey<T>;
export function joinDataKey(path: DataPath): string;
export function joinDataKey(path: DataPath): string {
	return path.join(".");
}

/**
 * Get an optional (possibly deep) prop from a data object, or `undefined` if it doesn't exist.
 * @example getDataProp<{ a: { b: number } }>({ a: { b: 123 } }, ["a", "b"]); // Returns `123`
 * @example getDataProp<{ a: { b: number } }>({ a: { b: 123 } }, "a.b"); // Returns `123`
 * @example getDataProp({ a: { b: 123 } } as Data, "x.y.z"); // Returns `undefined`
 */
export function getDataProp<T extends Data, K extends BranchDataKey<T>>(data: T, key: K): BranchData<T>[K];
export function getDataProp<T extends Data, K extends BranchDataKey<T>>(data: DeepPartial<T>, key: K): BranchData<T>[K] | undefined;
export function getDataProp(data: Data, keyOrPath: string | DataPath): unknown;
export function getDataProp(data: Data, keyOrPath: string | DataPath): unknown {
	const path = typeof keyOrPath === "string" ? splitDataKey(keyOrPath) : keyOrPath;
	let current: unknown = data;
	for (const k of path) {
		if (!isObject(current)) return undefined;
		current = current[k];
	}
	return current;
}
