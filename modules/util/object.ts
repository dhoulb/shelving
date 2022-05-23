import { AssertionError } from "../error/index.js";
import { setProp, setProps, withProp, withProps } from "./data.js";
import type { ImmutableArray } from "./array.js";

/** Readonly object with string keys. */
export type ImmutableObject<T = unknown> = { readonly [key: string | number]: T };

/** Writable object with string keys. */
export type MutableObject<T = unknown> = { [key: string | number]: T };

/** Extract the type for the values of an object. */
export type ObjectType<T extends ImmutableObject> = T[keyof T];

/**
 * Is a value an unknown object?
 * - This is a TypeScript assertion object that asserts the value extends `ImmutableObject`
 * - Note: Arrays and other complex objects will return true.
 */
export const isObject = <T extends ImmutableObject>(value: T | unknown): value is T => typeof value === "object" && value !== null;

/** Assert that a value is an object */
export function assertObject<T extends ImmutableObject>(value: T | unknown): asserts value is T {
	if (!isObject(value)) throw new AssertionError(`Must be object`, value);
}

/** Is a value a plain object? */
export const isPlainObject = <T extends ImmutableObject>(value: T | unknown): value is T => isObject(value) && value.constructor === Object;

/** Assert that a value is a plain object */
export function assertPlainObject<T extends ImmutableObject>(value: T | unknown): asserts value is T {
	if (!isPlainObject(value)) throw new AssertionError(`Must be plain object`, value);
}

/** Is an unknown string an own prop of an object. */
export const isKey = <T extends ImmutableObject>(obj: T, key: unknown): key is keyof T => (typeof key === "string" || typeof key === "number" || typeof key === "symbol") && Object.prototype.hasOwnProperty.call(obj, key);

/** Assert that a value is an object with a specific property. */
export function assertKey<K extends string | number | symbol, T extends { [L in K]: unknown }>(value: T | unknown, key: K): asserts value is T {
	if (!isObject(value) || !(key in value)) throw new AssertionError(`Must be object with prop "${key}"`, value);
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
		const { [key]: unused, ...output } = input;
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
export function deleteEntry<T>(obj: MutableObject<T>, key: string, value?: T): void {
	if (value === undefined || obj[key] === value) delete obj[key];
}

/**
 * Remove several key/value entries from a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param entries Set of keys or entries to remove.
 */
export function deleteEntries<T>(obj: MutableObject<T>, keys: ImmutableArray<string>): void {
	for (const key of keys) delete obj[key];
}

/** Type that represents an empty object. */
export type EmptyObject = { readonly [K in never]: never };

/** An empty object. */
export const EMPTY_OBJECT: EmptyObject = {};

/** Function that returns an an empty object. */
export const GET_EMPTY_OBJECT = (): EmptyObject => EMPTY_OBJECT;
