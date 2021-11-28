import { Data, isKey, Key, toProps } from "./data.js";
import type { ImmutableArray } from "./array.js";
import type { PossibleOptionalDate } from "./date.js";

/** Readonly object with string keys. */
export type ImmutableObject<T = unknown> = { readonly [key: string]: T };

/** Writable object with string keys. */
export type MutableObject<T = unknown> = { [key: string]: T };

/** Extract the type for the values of an object. */
export type ObjectType<T extends ImmutableObject> = T[keyof T & string];

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

/**
 * Is a value an unknown object?
 * - This is a TypeScript assertion object that asserts the value extends `ImmutableObject`
 * - Note: Arrays and other complex objects will return true.
 */
export const isObject = <T extends Data>(value: T | unknown): value is T => typeof value === "object" && value !== null;

/** Is a value a plain object? */
export const isPlainObject = <T extends Data>(value: T | unknown): value is T => isObject(value) && value.constructor === Object;

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
 * Add a key/value entry to a map-like object (immutably).
 *
 * @param input The input object.
 * @param key The key of the entry to add.
 * @param value The value of the entry to add. If set, the entry will only be added if its current value is not `value`
 *
 * @return New object without the specified entry (or same object if entry value didn't change).
 */
export const withEntry: <T>(input: ImmutableObject<T>, key: string, value: T) => ImmutableObject<T> = withProp;

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
 * Add several key/value entries on a map-like object (immutably).
 *
 * @param input The input object.
 * @return New object with the specified entries added (or same object if no entries changed).
 */
export const withEntries: <T>(input: ImmutableObject<T>, entries: ImmutableObject<T>) => ImmutableObject<T> = withProps;

/**
 * Remove a key/value entry from a map-like object (immutably).
 *
 * @param input The input object.
 * @param key The key of the entry to remove.
 * @param value The value of the entry to remove. If not undefined, the entry will only be removed if its current value is exactly `value`
 *
 * @return New object without the specified entries (or same object if the entry didn't exist).
 * - If `key` doesn't already exist in `obj` then the exact same input object will be returned.
 */
export function withoutEntry<T>(input: ImmutableObject<T>, key: string, value?: T): ImmutableObject<T> {
	if (isKey(input, key) && (value === undefined || input[key] === value)) {
		const { [key]: unused, ...output } = input; // eslint-disable-line @typescript-eslint/no-unused-vars
		return output;
	}
	return input;
}

/**
 * Remove several key/value entries from a map-like object (immutably).
 *
 * @param input The input object.
 * @param entries Set of keys or entries to remove.
 *
 * @return New object without the specified entries (or same object if none of the entries existed).
 * - If every entry already exists and has the exact same input object will be returned.
 */
export function withoutEntries<T>(input: ImmutableObject<T>, entries: Iterable<string>): ImmutableObject<T> {
	let changed = false;
	const output: MutableObject<T> = { ...input };
	for (const key of entries)
		if (isKey(input, key)) {
			delete output[key];
			changed = true;
		}
	return changed ? output : input;
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
 * Set a key/value entry on a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param key The key of the prop in the object to set.
 * @param value The value to set the prop to.
 */
export const setEntry: <T>(obj: MutableObject<T>, key: string, value: T) => void = setProp;

/**
 * Set several key/value entries on a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param entries An object containing new props to set on the object.
 */
export const setEntries: <T>(obj: MutableObject<T>, entries: ImmutableObject<T>) => void = setProps;

/**
 * Remove a key/value entry from a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param key The key of the entry to remove.
 * @param value The value of the entry to remove. If set, the entry will only be removed if its current value is exactly `value`
 */
export function removeEntry<T>(obj: MutableObject<T>, key: string, value?: T): void {
	if (value === undefined || obj[key] === value) delete obj[key];
}

/**
 * Remove several key/value entries from a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param entries Set of keys or entries to remove.
 */
export function removeEntries<T>(obj: MutableObject<T>, keys: ImmutableArray<string>): void {
	for (const key of keys) delete obj[key];
}
