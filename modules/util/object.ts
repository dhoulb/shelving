import { AssertionError } from "../error/AssertionError.js";
import type { ImmutableArray } from "./array.js";

/** Readonly map-like object. */
export type ImmutableObject<T = unknown> = { readonly [key: PropertyKey]: T };

/** Writable map-like object. */
export type MutableObject<T = unknown> = { [key: PropertyKey]: T };

/** Get the type of the _keys_ of a map-like object.. */
export type ObjectKey<T extends ImmutableObject> = keyof T;

/** Get the type of the _values_ of a map-like object. */
export type ObjectValue<T extends ImmutableObject> = T[ObjectKey<T>];

/** Get the type for a prop of a map-like object in entry format. */
export type ObjectProp<T extends ImmutableObject> = readonly [ObjectKey<T>, ObjectValue<T>];

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

/** Is an unknown value the key for an own prop of an object. */
export const isObjectKey = <T extends ImmutableObject>(obj: T, key: unknown): key is ObjectKey<T> => (typeof key === "string" || typeof key === "number" || typeof key === "symbol") && Object.prototype.hasOwnProperty.call(obj, key);

/** Turn a data object into an array of props. */
export function getObjectProps<T extends ImmutableObject>(data: T): ImmutableArray<ObjectProp<T>>;
export function getObjectProps<T extends ImmutableObject>(data: T | Partial<T>): ImmutableArray<ObjectProp<T>>;
export function getObjectProps<T>(data: ImmutableObject<T>): ImmutableArray<ObjectProp<ImmutableObject<T>>>;
export function getObjectProps<T>(data: ImmutableObject<T>): ImmutableArray<ObjectProp<ImmutableObject<T>>> {
	return Object.entries<T>(data);
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
export function getObjectProp<T extends ImmutableObject, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(obj: T, k1: K1, k2: K2, k3: K3, k4: K4): T[K1][K2][K3][K4];
export function getObjectProp<T extends ImmutableObject, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(obj: T, k1: K1, k2: K2, k3: K3): T[K1][K2][K3];
export function getObjectProp<T extends ImmutableObject, K1 extends keyof T, K2 extends keyof T[K1]>(obj: T, k1: K1, k2: K2): T[K1][K2];
export function getObjectProp<T extends ImmutableObject, K1 extends keyof T>(obj: T, k1: K1): T[K1];
export function getObjectProp<T extends ImmutableObject, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
	data: T,
	k1: K1,
	k2?: K2,
	k3?: K3,
	k4?: K4,
): T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4] {
	return k2 === undefined ? data[k1] : k3 === undefined ? data[k1][k2] : k4 === undefined ? data[k1][k2][k3] : data[k1][k2][k3][k4];
}

/** Set a prop on an object (immutably) and return a new object including that prop. */
export function withObjectProp<T extends ImmutableObject, K extends ObjectKey<T>>(input: T, key: K, value: T[K]): T {
	return input[key] === value ? input : { ...input, [key]: value };
}

/** Set several props on an object (immutably) and return a new object including those props. */
export function withObjectProps<T extends ImmutableObject>(input: T, props: T | Partial<T>): T {
	for (const [k, v] of Object.entries(props)) if (input[k] !== v) return { ...input, ...props };
	return input;
}

/** Remove several key/value entries from an object (immutably) and return a new object without those props. */
export function withoutObjectProps<T extends ImmutableObject, K extends ObjectKey<T>>(input: T, ...keys: K[]): Omit<T, K> {
	for (const key of keys) if (key in input) return Object.fromEntries(Object.entries(input).filter(_doesntHaveKey, keys)) as Omit<T, K>;
	return input;
}
function _doesntHaveKey(this: (string | number)[], [key]: [string | number, unknown]) {
	return !this.includes(key);
}

/** Pick several props from an object and return a new object with only thos props. */
export function pickObjectProps<T extends ImmutableObject, K extends ObjectKey<T>>(input: T, ...keys: ObjectKey<T>[]): Pick<T, K> {
	return Object.fromEntries(Object.entries(input).filter(_doesHaveKey, keys)) as Pick<T, K>;
}
function _doesHaveKey(this: (string | number)[], [key]: [string | number, unknown]) {
	return this.includes(key);
}

/** Set a single named prop on an object (by reference) and return its value. */
export function setObjectProp<T extends MutableObject, K extends ObjectKey<T>>(data: T, key: K, value: T[K]): T[K] {
	data[key] = value;
	return value;
}

/** Set several named props on an object (by reference). */
export function setObjectProps<T extends MutableObject>(obj: T, props: Partial<T>): void {
	for (const [k, v] of getObjectProps<T>(props)) obj[k] = v;
}

/** Remove several key/value entries from an object (by reference). */
export function deleteObjectProps<T extends MutableObject>(obj: T, ...keys: ObjectKey<T>[]): void {
	for (const key of keys) delete obj[key];
}

/** Type that represents an empty object. */
export type EmptyObject = { readonly [K in never]: never };

/** An empty object. */
export const EMPTY_OBJECT: EmptyObject = {};

/** Function that returns an an empty object. */
export const getEmptyObject = (): EmptyObject => EMPTY_OBJECT;
