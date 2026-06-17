import type { UnionToIntersection } from "@google-cloud/firestore";
import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import type { EntryObject } from "./entry.js";
import type { AnyCaller } from "./function.js";
import type { DeepPartial } from "./object.js";
import { isObject, isPlainObject } from "./object.js";
import type { Segments } from "./string.js";
import type { Resolve } from "./types.js";

/**
 * Data object — a plain object with `string` keys and `unknown` values.
 *
 * @see https://dhoulb.github.io/shelving/util/data/Data
 */
export type Data = { readonly [K in string]: unknown };

/**
 * Partial data object (values can be explicitly `undefined`).
 *
 * @see https://dhoulb.github.io/shelving/util/data/PartialData
 */
export type PartialData<T extends Data> = { readonly [K in keyof T]?: T[K] | undefined };

/**
 * Helper type to get the key for a data object prop.
 *
 * @see https://dhoulb.github.io/shelving/util/data/DataKey
 */
export type DataKey<T extends Data> = keyof T & string;

/**
 * Helper type to get the value for a data object prop.
 *
 * @see https://dhoulb.github.io/shelving/util/data/DataValue
 */
export type DataValue<T extends Data> = T[DataKey<T>];

/**
 * Helper type to get a prop for a data object.
 * i.e. `DataProp<{ a: number }>` produces `readonly ["a", number"]`
 *
 * @see https://dhoulb.github.io/shelving/util/data/DataProp
 */
export type DataProp<T extends Data> = {
	readonly [K in DataKey<T>]: readonly [K, T[K]];
}[DataKey<T>];

/**
 * Helper type to get a flattened data object with every branch node of the data, flattened into `a.c.b` format.
 * i.e. `BranchData<{ a: { a2: number } }>` produces `{ "a": object, "a.a2": number }`
 *
 * @see https://dhoulb.github.io/shelving/util/data/BranchData
 */
export type BranchData<T extends Data> = EntryObject<BranchDataProp<T>>;

/**
 * Helper type to get the path for a flattened data object with deep paths flattened into `a.c.b` format.
 *
 * @see https://dhoulb.github.io/shelving/util/data/BranchDataPath
 */
export type BranchDataPath<T extends Data> = BranchDataProp<T>[0];

/**
 * Helper type to get the value for a flattened data object with deep paths flattened into `a.c.b` format.
 *
 * @see https://dhoulb.github.io/shelving/util/data/BranchDataValue
 */
export type BranchDataValue<T extends Data> = BranchDataProp<T>[1];

/**
 * Helper type to get the prop for a flattened data object with deep paths flattened into `a.c.b` format.
 *
 * @see https://dhoulb.github.io/shelving/util/data/BranchDataProp
 */
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
 *
 * @see https://dhoulb.github.io/shelving/util/data/BranchDataSegments
 */
export type BranchDataSegments<T extends Data> = {
	readonly [K in DataKey<T>]: T[K] extends Data ? readonly [K] | readonly [K, ...BranchDataSegments<T[K]>] : readonly [K];
}[DataKey<T>];

/**
 * Helper type to get a flattened data object with only leaf nodes of the data, flattened into `a.c.b` format.
 * i.e. `LeafData<{ a: { a2: number } }>` produces `{ "a.a2": number }`
 *
 * @see https://dhoulb.github.io/shelving/util/data/LeafData
 */
export type LeafData<T extends Data> = EntryObject<LeafDataProp<T>>;

/**
 * Helper type to get the leaf paths for a flattened data object with deep paths flattened into `a.c.b` format.
 *
 * @see https://dhoulb.github.io/shelving/util/data/LeafDataPath
 */
export type LeafDataPath<T extends Data> = LeafDataProp<T>[0];

/**
 * Helper type to get the leaf values for a flattened data object with deep paths flattened into `a.c.b` format.
 *
 * @see https://dhoulb.github.io/shelving/util/data/LeafDataValue
 */
export type LeafDataValue<T extends Data> = LeafDataProp<T>[1];

/**
 * Helper type to get the leaf props for a flattened data object with deep paths flattened into `a.c.b` format.
 *
 * @see https://dhoulb.github.io/shelving/util/data/LeafDataProp
 */
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
 *
 * @see https://dhoulb.github.io/shelving/util/data/LeafDataSegments
 */
export type LeafDataSegments<T extends Data> = {
	readonly [K in DataKey<T>]: T[K] extends Data ? readonly [K, ...LeafDataSegments<T[K]>] : readonly [K];
}[DataKey<T>];

/**
 * Object with one level of data nested beneath each prop.
 * i.e. `{ A: { a: number }, B: { b: string } }`
 *
 * @see https://dhoulb.github.io/shelving/util/data/NestedData
 */
export type NestedData = { readonly [key: string]: Data };

/**
 * Helper type to flatten one level of nested data into a single flat `Data` type.
 * i.e. `FlattenData<{ A: { a: number }, B: { b: string } }>` produces `{ a: number, b: string }`
 *
 * @see https://dhoulb.github.io/shelving/util/data/FlatData
 */
export type FlatData<T extends NestedData> = Resolve<UnionToIntersection<T[keyof T]>>;

/**
 * Is an unknown value a data object?
 *
 * @param value The value to check.
 * @returns `true` if the value is a plain data object, narrowing it to [`Data`](/util/data/Data).
 * @example isData({ a: 1 }) // true
 * @see https://dhoulb.github.io/shelving/util/data/isData
 */
export function isData(value: unknown): value is Data {
	return isPlainObject(value);
}

/**
 * Assert that an unknown value is a data object.
 *
 * @param value The value to check.
 * @param caller The function to attribute a thrown error to (defaults to `assertData`).
 * @throws {RequiredError} If the value is not a plain data object.
 * @example assertData(value); // throws unless `value` is a `Data` object
 * @see https://dhoulb.github.io/shelving/util/data/assertData
 */
export function assertData(value: unknown, caller: AnyCaller = assertData): asserts value is Data {
	if (!isPlainObject(value)) throw new RequiredError("Must be data object", { received: value, caller });
}

/**
 * Is an unknown value the key for an own prop of a data object?
 *
 * @param data The data object to check against.
 * @param key The value to check as a key.
 * @returns `true` if `key` is an own string key of `data`, narrowing it to [`DataKey<T>`](/util/data/DataKey).
 * @example isDataProp({ a: 1 }, "a") // true
 * @see https://dhoulb.github.io/shelving/util/data/isDataProp
 */
export function isDataProp<T extends Data>(data: T, key: unknown): key is DataKey<T> {
	return typeof key === "string" && Object.hasOwn(data, key);
}

/**
 * Assert that an unknown value is the key for an own prop of a data object.
 *
 * @param data The data object to check against.
 * @param key The value to check as a key.
 * @param caller The function to attribute a thrown error to (defaults to `assertDataProp`).
 * @throws {RequiredError} If `key` is not an own key of `data`.
 * @example assertDataProp(data, key); // throws unless `key` exists in `data`
 * @see https://dhoulb.github.io/shelving/util/data/assertDataProp
 */
export function assertDataProp<T extends Data>(data: T, key: unknown, caller: AnyCaller = assertDataProp): asserts key is DataKey<T> {
	if (!isDataProp(data, key)) throw new RequiredError("Key must exist in data object", { key, data, caller });
}

/**
 * Get the props of a data object as a set of entries.
 *
 * @param data The data object to read.
 * @returns An immutable array of `[key, value]` prop tuples.
 * @example getDataProps({ a: 1, b: 2 }) // [["a", 1], ["b", 2]]
 * @see https://dhoulb.github.io/shelving/util/data/getDataProps
 */
export function getDataProps<T extends Data>(data: T): ImmutableArray<DataProp<T>>;
export function getDataProps<T extends Data>(data: T | Partial<T>): ImmutableArray<DataProp<T>>;
export function getDataProps(data: Data | Partial<Data>): ImmutableArray<DataProp<Data>> {
	return Object.entries(data);
}

/**
 * Get the keys of a data object as an array.
 *
 * @param data The data object to read.
 * @returns An immutable array of the object's string keys.
 * @example getDataKeys({ a: 1, b: 2 }) // ["a", "b"]
 * @see https://dhoulb.github.io/shelving/util/data/getDataKeys
 */
export function getDataKeys<T extends Data>(data: T): ImmutableArray<DataKey<T>>;
export function getDataKeys<T extends Data>(data: T | Partial<T>): ImmutableArray<DataKey<T>>;
export function getDataKeys(data: Data | Partial<Data>): ImmutableArray<DataKey<Data>> {
	return Object.keys(data);
}

/**
 * Split a dotted path into data path segments.
 * - A path that is already an array of segments is returned unchanged.
 *
 * @param path The dotted path string (e.g. `"a.b"`) or an array of segments.
 * @returns The path as an array of segments.
 * @example splitDataPath<{ a: { b: number } }>("a.b"); // ["a", "b"]
 * @see https://dhoulb.github.io/shelving/util/data/splitDataPath
 */
export function splitDataPath<T extends Data>(path: BranchDataPath<T> | BranchDataSegments<T>): BranchDataSegments<T>;
export function splitDataPath<T extends Data>(path: LeafDataPath<T> | LeafDataSegments<T>): LeafDataSegments<T>;
export function splitDataPath(path: string | Segments): Segments;
export function splitDataPath(path: string | Segments): ImmutableArray<string> {
	return typeof path === "string" ? path.split(".") : path;
}

/**
 * Join a set of data path segments into a dotted path string.
 * - A path that is already a dotted string is returned unchanged.
 *
 * @param path An array of path segments, or an already-joined dotted path string.
 * @returns The path as a dotted string (e.g. `"a.b"`).
 * @example joinDataPath<{ a: { b: number } }>(["a", "b"]); // "a.b"
 * @see https://dhoulb.github.io/shelving/util/data/joinDataPath
 */
export function joinDataPath<T extends Data>(path: BranchDataSegments<T> | BranchDataPath<T>): BranchDataPath<T>;
export function joinDataPath<T extends Data>(path: LeafDataSegments<T> | LeafDataPath<T>): LeafDataPath<T>;
export function joinDataPath(path: Segments | string): string;
export function joinDataPath(path: Segments | string): string {
	return typeof path === "string" ? path : path.join(".");
}

/**
 * Get an optional (possibly deep) prop from a data object, or `undefined` if it doesn't exist.
 *
 * @param data The data object to read from.
 * @param path The dotted path string (e.g. `"a.b"`) or an array of segments pointing at the prop.
 * @returns The value at the path, or `undefined` if any segment along the path doesn't exist.
 * @example getDataProp<{ a: { b: number } }>({ a: { b: 123 } }, ["a", "b"]); // 123
 * @example getDataProp<{ a: { b: number } }>({ a: { b: 123 } }, "a.b"); // 123
 * @example getDataProp({ a: { b: 123 } } as Data, "x.y.z"); // undefined
 * @see https://dhoulb.github.io/shelving/util/data/getDataProp
 */
export function getDataProp<T extends Data, K extends BranchDataPath<T>>(data: T, path: K): BranchData<T>[K];
export function getDataProp<T extends Data, K extends BranchDataPath<T>>(data: DeepPartial<T>, path: K): BranchData<T>[K] | undefined;
export function getDataProp(data: Data, path: string | Segments): unknown;
export function getDataProp(data: Data, path: string | Segments): unknown {
	const segments = splitDataPath(path);
	let current: unknown = data;
	for (const segment of segments) {
		if (!isObject(current)) return undefined;
		current = current[segment];
	}
	return current;
}
