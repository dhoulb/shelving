import { RequiredError } from "../error/index.js";
import type { ImmutableArray } from "./array.js";
import { PossibleOptionalDate } from "./date.js";

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

/** Is an unknown value a data object? */
export const isData = <T extends Data>(value: T | unknown): value is T => typeof value === "object" && value !== null;

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

/** Get the data of a result (returns data or throws `RequiredError` if value is `null` or `undefined`). */
export function getData<T extends Data>(result: Result<T>): T {
	if (!result) throw new RequiredError("Data is required");
	return result;
}

/**
 * Extract the value of a named prop from an object.
 * - Extraction is possibly deep if deeper keys are specified.
 *
 * @param obj The target object to get from.
 * @param k1 The key of the prop in the object to get.
 * @param k2 The sub-key of the prop in the object to get.
 * @param k3 The sub-sub-key of the prop in the object to get.
 * @param k4 The sub-sub-sub-key of the prop in the object to get.
 */
export function getProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(obj: T, k1: K1, k2: K2, k3: K3, k4: K4): T[K1][K2][K3][K4]; // prettier-ignore
export function getProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(obj: T, k1: K1, k2: K2, k3: K3): T[K1][K2][K3]; // prettier-ignore
export function getProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1]>(obj: T, k1: K1, k2: K2): T[K1][K2]; // prettier-ignore
export function getProp<T extends Data, K1 extends keyof T>(obj: T, k1: K1): T[K1];
export function getProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
	obj: T,
	k1: K1,
	k2?: K2,
	k3?: K3,
	k4?: K4,
): T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4] {
	return !k2 ? obj[k1] : !k3 ? obj[k1][k2] : !k4 ? obj[k1][k2][k3] : obj[k1][k2][k3][k4];
}

/** Extract a date property from an object. */
export const DATE_PROP = <T extends PossibleOptionalDate>({ date }: { date: T }): T => date;

/** Extract an order property from an object. */
export const ORDER_PROP = ({ order }: { order: number }): number => order;

/** Extract a string title property from an object. */
export const TITLE_PROP = ({ title }: { title: string }): string => title;

/** Extract a string name property from an object. */
export const NAME_PROP = ({ name }: { name: string }): string => name;

/** Extract a number size property from an object. */
export const SIZE_PROP = ({ size }: { size: number }): number => size;

/** Extract a number size property from an object. */
export const LENGTH_PROP = ({ length }: { length: number }): number => length;

/**
 * Set a prop on an object with known shape (immutably).
 *
 * @param input The input object.
 * @param key The key of the entry to add.
 * @param value The value of the entry to add. If set, the entry will only be added if its current value is not `value`
 *
 * @return New object without the specified prop (or same object if prop value didn't change).
 */
export function withProp<T extends Data, K extends Key<T>>(input: T, key: K, value: T[K]): T {
	return input[key] === value ? input : { ...input, [key]: value };
}

/**
 * Set several props on an object with known shape (immutably).
 *
 * @param input The input object.
 * @return New object with the specified prop added (or same object if no props changed).
 */
export function withProps<T extends Data>(input: T, props: T | Partial<T>): T {
	for (const [k, v] of Object.entries(props)) if (input[k] !== v) return { ...input, ...props };
	return input;
}

/**
 * Set a single named prop on an object with a known shape (by reference).
 *
 * @param obj The target object to modify.
 * @param key The key of the prop in the object to set.
 * @param value The value to set the prop to.
 */
export function setProp<T extends Data, K extends keyof T>(obj: T, key: K, value: T[K]): void {
	obj[key] = value;
}

/**
 * Set several named props on an object with a known shape (by reference).
 *
 * @param obj The target object to modify.
 * @param props An object containing new props to set on the object.
 */
export function setProps<T extends Data>(obj: T, props: { [K in keyof T]?: T[K] }): void {
	for (const [k, v] of toProps<T>(props)) obj[k] = v;
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
