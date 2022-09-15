import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import { isPlainObject } from "./object.js";

/** Data object. */
export type Data = { readonly [K in string]: unknown };

/** Prop for a data object. */
export type DataProp<T extends Data> = readonly [keyof T & string, T[keyof T & string]];

/** Key for a data object prop. */
export type DataKey<T extends Data> = keyof T & string;

/** Value for a data object prop. */
export type DataValue<T extends Data> = T[keyof T & string];

/** Data or `null` to indicate the data doesn't exist. */
export type OptionalData<T extends Data> = T | null;

/** Set of named data objects. */
export type Datas = { readonly [K in string]: Data };

/** Is an unknown value a data object? */
export const isData = <T extends Data>(value: T | unknown): value is T => isPlainObject(value);

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

/** Type that represents an empty data object. */
export type EmptyData = { readonly [K in never]: never };

/** An empty object. */
export const EMPTY_DATA: EmptyData = {};

/** Function that returns an an empty object. */
export const getEmptyData = (): EmptyData => EMPTY_DATA;
