import { AssertionError } from "../error/AssertionError.js";
import type { ImmutableArray } from "./array.js";
import type { Data, Prop } from "./data.js";
import type { Entry } from "./entry.js";

/** Readonly object with string keys. */
export type ImmutableObject<T = unknown> = { readonly [key: string | number]: T };

/** Writable object with string keys. */
export type MutableObject<T = unknown> = { [key: string | number]: T };

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
export function isPlainObject<T extends ImmutableObject>(value: T | unknown): value is T {
	if (isObject(value)) {
		const proto = Object.getPrototypeOf(value);
		return proto === null || proto === Object.prototype;
	}
	return false;
}

/** Assert that a value is a plain object */
export function assertPlainObject<T extends ImmutableObject>(value: T | unknown): asserts value is T {
	if (!isPlainObject(value)) throw new AssertionError(`Must be plain object`, value);
}

/** Is an unknown string an own prop of an object. */
export const isProp = <T extends ImmutableObject>(obj: T, key: unknown): key is keyof T => (typeof key === "string" || typeof key === "number" || typeof key === "symbol") && Object.prototype.hasOwnProperty.call(obj, key);

/** Turn a data object into an array of props. */
export function getProps<T extends Data>(data: T): ImmutableArray<Prop<T>>;
export function getProps<T extends Data>(data: T | Partial<T>): ImmutableArray<Prop<T>>;
export function getProps<T extends ImmutableObject>(data: T): ImmutableArray<Entry<keyof T, T[keyof T]>>;
export function getProps<T extends ImmutableObject>(data: T | Partial<T>): ImmutableArray<Entry<keyof T, T[keyof T]>>;
export function getProps<T extends ImmutableObject>(data: T): ImmutableArray<Entry<string, unknown>> {
	return Object.entries(data);
}

/**
 * Extract the value of a named prop from a data object.
 * - Extraction is possibly deep if deeper keys are specified.
 *
 * @param obj The target object to get from.
 * @param k1 The key of the prop in the object to get.
 * @param k2 The sub-key of the prop in the object to get.
 * @param k3 The sub-sub-key of the prop in the object to get.
 * @param k4 The sub-sub-sub-key of the prop in the object to get.
 */
export function getProp<T extends ImmutableObject, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(obj: T, k1: K1, k2: K2, k3: K3, k4: K4): T[K1][K2][K3][K4];
export function getProp<T extends ImmutableObject, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(obj: T, k1: K1, k2: K2, k3: K3): T[K1][K2][K3];
export function getProp<T extends ImmutableObject, K1 extends keyof T, K2 extends keyof T[K1]>(obj: T, k1: K1, k2: K2): T[K1][K2];
export function getProp<T extends ImmutableObject, K1 extends keyof T>(obj: T, k1: K1): T[K1];
export function getProp<T extends ImmutableObject, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
	data: T,
	k1: K1,
	k2?: K2,
	k3?: K3,
	k4?: K4,
): T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4] {
	return k2 === undefined ? data[k1] : k3 === undefined ? data[k1][k2] : k4 === undefined ? data[k1][k2][k3] : data[k1][k2][k3][k4];
}

/**
 * Set a prop on an object (immutably).
 *
 * @param input The input data object.
 * @param key The key of the entry to add.
 * @param value The value of the entry to add. If set, the entry will only be added if its current value is not `value`
 *
 * @return New object without the specified prop (or same object if prop value didn't change).
 */
export function withProp<T extends ImmutableObject, K extends keyof T>(input: T, key: K, value: T[K]): T {
	return input[key] === value ? input : { ...input, [key]: value };
}

/**
 * Set several props on an object (immutably).
 *
 * @param input The input data object.
 * @param props Set of props to add to the object.
 * @return New object with the specified prop added (or same object if no props changed).
 */
export function withProps<T extends ImmutableObject>(input: T, props: T | Partial<T>): T {
	for (const [k, v] of Object.entries(props)) if (input[k] !== v) return { ...input, ...props };
	return input;
}

/**
 * Remove several key/value entries from an object (immutably).
 *
 * @param input The input object.
 * @param keys Set of keys for props to remove.
 *
 * @return New object without the specified entries (or same object if none of the entries existed).
 */
export function withoutProps<T extends ImmutableObject, K extends keyof T>(input: T, ...keys: K[]): Omit<T, K> {
	for (const key of keys) if (key in input) return Object.fromEntries(Object.entries(input).filter(_doesntHaveKey, keys)) as Omit<T, K>;
	return input;
}
function _doesntHaveKey(this: (string | number)[], [key]: [string | number, unknown]) {
	return !this.includes(key);
}

/**
 * Pick several props from an object (immutably).
 *
 * @param input The input object.
 * @param keys Set of keys for props to pick.
 *
 * @return New object with only the specified props.
 */
export function pickProps<T extends ImmutableObject, K extends keyof T>(input: T, ...keys: (keyof T)[]): Pick<T, K> {
	return Object.fromEntries(Object.entries(input).filter(_doesHaveKey, keys)) as Pick<T, K>;
}
function _doesHaveKey(this: (string | number)[], [key]: [string | number, unknown]) {
	return this.includes(key);
}

/**
 * Set a single named prop on an object (by reference).
 *
 * @param data The target data object to modify.
 * @param key The key of the prop in the object to set.
 * @param value The value to set the prop to.
 */
export function setProp<T extends MutableObject, K extends keyof T>(data: T, key: K, value: T[K]): T[K] {
	data[key] = value;
	return value;
}

/**
 * Set several named props on an object (by reference).
 *
 * @param obj The target object to modify.
 * @param props An object containing new props to set on the object.
 */
export function setProps<T extends MutableObject>(obj: T, props: Partial<T>): void {
	for (const [k, v] of getProps<T>(props)) obj[k] = v;
}

/**
 * Remove several key/value entries from an object (by reference).
 *
 * @param obj The target object to modify.
 * @param keys Set of keys or keys to remove.
 */
export function deleteProps<T extends MutableObject>(obj: T, ...keys: (keyof T)[]): void {
	for (const key of keys) delete obj[key];
}

/** Type that represents an empty object. */
export type EmptyObject = { readonly [K in never]: never };

/** An empty object. */
export const EMPTY_OBJECT: EmptyObject = {};

/** Function that returns an an empty object. */
export const getEmptyObject = (): EmptyObject => EMPTY_OBJECT;
