import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";

/** Data object. */
export type Data = { readonly [K in string]: unknown };

/** Get the type of the _keys_ of a data object. */
export type DataKey<T extends Data> = keyof T & string;

/** Get the type of the _values_ of a data object. */
export type DataValue<T extends Data> = T[DataKey<T>];

/** Get the type for a prop of a data object in entry format. */
export type DataProp<T extends Data> = readonly [DataKey<T>, DataValue<T>];

/** Data or `null` to indicate the data doesn't exist. */
export type OptionalData<T extends Data> = T | null;

/** Empty data object. */
export type EmptyData = { readonly [K in never]: never };

/** Set of named data objects. */
export type Datas = { readonly [K in string]: Data };

/** Is an unknown value a data object? */
export const isData = <T extends Data>(value: T | unknown): value is T => typeof value === "object" && value !== null;

/** Is an unknown value the key for an own prop of a data object. */
export const isDataKey = <T extends Data>(obj: T, key: unknown): key is DataKey<T> => typeof key === "string" && Object.prototype.hasOwnProperty.call(obj, key);

/** Get the data of a result (returns data or throws `RequiredError` if value is `null` or `undefined`). */
export function getData<T extends Data>(result: OptionalData<T>): T {
	if (!result) throw new RequiredError("Data is required");
	return result;
}

/** Get the props of a data object. */
export function getDataProps<T extends Data>(data: T): ImmutableArray<DataProp<T>>;
export function getDataProps<T extends Data>(data: T | Partial<T>): ImmutableArray<DataProp<T>>;
export function getDataProps(data: Data | Partial<Data>): ImmutableArray<DataProp<Data>> {
	return Object.entries(data);
}

/**
 * Mutable type is the opposite of `Readonly<T>` helper type.
 * - See https://github.com/microsoft/TypeScript/issues/24509
 * - Consistency with `Readonly<T>`
 */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Deep partial object: deeply convert an object to its partial version.
 * - Any value that extends `Data` has its props made partial.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `Data`), not arrays and functions.
 */
export type DeepPartial<T extends Data> = { [K in keyof T]?: T[K] extends Data ? DeepPartial<T[K]> : T[K] };

/**
 * Deep mutable object: deeply convert an object to its mutable version.
 * - Any value that extends `Data` has its props made mutable.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `Data`), not arrays and functions.
 */
export type DeepMutable<T extends Data> = { -readonly [K in keyof T]: T[K] extends Data ? DeepMutable<T[K]> : T[K] };

/**
 * Deep readonly object: deeply convert an object to its readonly version.
 * - Any value that extends `Data` has its props made readonly.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `Data`), not arrays and functions.
 */
export type DeepReadonly<T extends Data> = { +readonly [K in keyof T]: T[K] extends Data ? DeepReadonly<T[K]> : T[K] };

/** Pick only the properties of an object that match a type. */
export type PickProps<T, TT> = Pick<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>;

/** Omit the properties of an object that match a type. */
export type OmitProps<T, TT> = Omit<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>;

/**
 * Format a data object as a string.
 * - Use the custom `.toString()` function if it exists (don't use built in `Object.prototype.toString` because it's useless.
 * - Use `.title` or `.name` or `.id` if they exist and are strings.
 * - Use `Object` otherwise.
 */
export function formatData(data: Data): string {
	const { toString, name, title, id } = data;
	if (typeof toString === "function" && toString !== Object.prototype.toString) return data.toString();
	if (typeof name === "string") return name;
	if (typeof title === "string") return title;
	if (typeof id === "string") return id;
	return "Object";
}
