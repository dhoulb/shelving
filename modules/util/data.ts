import type { ImmutableArray } from "./array.js";
import type { EntryObject } from "./entry.js";
import { AssertionError } from "../error/AssertionError.js";
import { RequiredError } from "../error/RequiredError.js";
import { isPlainObject } from "./object.js";

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

/** Data or `null` to indicate the data doesn't exist. */
export type OptionalData<T extends Data> = T | null;

/** Set of named data objects. */
export type Datas = { readonly [K in string]: Data };

/** Flattened data object with deep keys flattened into `a.c.b` format. */
export type FlatData<T extends Data> = EntryObject<FlatDataProp<T>>;

/** Key for a flattened data object with deep keys flattened into `a.c.b` format. */
export type FlatDataKey<T extends Data> = FlatDataProp<T>[0];

/** Value for a flattened data object with deep keys flattened into `a.c.b` format. */
export type FlatDataValue<T extends Data> = FlatDataProp<T>[1];

/** Prop for a flattened data object with deep keys flattened into `a.c.b` format. */
export type FlatDataProp<T extends Data> = {
	readonly [K in DataKey<T>]: (
		T[K] extends Data
			? FlatDataProp<T[K]> //
			: [null, T[K]]
	) extends infer E
		? E extends [infer KK, infer VV]
			? [KK extends string ? `${K}.${KK}` : K, VV]
			: never
		: never;
}[DataKey<T>];

/** Is an unknown value a data object? */
export const isData = <T extends Data>(value: T | unknown): value is T => isPlainObject(value);

/** Assert that an unknown value is a data object. */
export function assertData<T extends Data>(value: T | unknown): asserts value is T {
	if (!isPlainObject(value)) throw new AssertionError("Must be data", value);
}

/** Is an unknown value the key for an own prop of a data object. */
export const isDataProp = <T extends Data>(obj: T, key: unknown): key is DataKey<T> => typeof key === "string" && Object.prototype.hasOwnProperty.call(obj, key);

/** Get the data of a result (returns data or throws `RequiredError` if value is `null` or `undefined`). */
export function getData<T extends Data>(result: OptionalData<T>): T {
	if (!result) throw new RequiredError("Data is required");
	return result;
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

/** Type that represents an empty data object. */
export type EmptyData = { readonly [K in never]: never };

/** An empty object. */
export const EMPTY_DATA: EmptyData = { __proto__: null };

/** Function that returns an an empty object. */
export const getEmptyData = (): EmptyData => EMPTY_DATA;
