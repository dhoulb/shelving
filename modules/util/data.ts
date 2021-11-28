import { RequiredError } from "../error/index.js";
import type { ImmutableArray } from "./array.js";

/** Data object. */
export type Data = { readonly [key: string]: unknown };

/** Key for a prop in a data object. */
export type Key<T extends Data> = keyof T & string;

/** Value for a prop in a data object. */
export type Value<T extends Data> = T[Key<T>];

/** Prop of a data object in entry format. */
export type Prop<T extends Data> = readonly [Key<T>, Value<T>];

/** Set of named data objects. */
export type Datas = { readonly [key: string]: Data };

/** Data or `undefined` */
export type Result<T extends Data = Data> = T | undefined;

/** Iterable set of results in entry format. */
export type Results<T extends Data = Data> = Iterable<readonly [string, T]>;

/** Is an unknown string an own prop of an object. */
export const isKey = <T extends Data, K extends keyof T>(obj: T, key: K | string): key is K => Object.prototype.hasOwnProperty.call(obj, key);

/** Turn a data object into an array of entries (if it isn't one already). */
export function toProps<T extends Data>(input: T): ImmutableArray<Prop<T>>;
export function toProps<T extends Data>(input: Partial<T>): ImmutableArray<Prop<T>>;
export function toProps<T extends Data>(input: T | Partial<T>): ImmutableArray<Prop<T>> {
	return Object.entries(input) as ImmutableArray<Prop<T>>;
}

/** Get a required value (returns value or throws `RequiredError` if value is `null` or `undefined`). */
export function getRequired<T>(v: T): Exclude<T, null | undefined>;
export function getRequired<T>(v: T | null | undefined): T;
export function getRequired<T>(v: T | null | undefined): T {
	if (v === undefined || v === null) throw new RequiredError(v === null ? "Required value is null" : "Required value is undefined");
	return v;
}

/** Get a required value (returns value or throws `RequiredError` if value is `null` or `undefined`). */
export function getData<T extends Data>(result: Result<T>): T {
	if (!result) throw new RequiredError("Data is required");
	return result;
}
