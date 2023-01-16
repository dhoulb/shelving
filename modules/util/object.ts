import { AssertionError } from "../error/AssertionError.js";
import type { ImmutableArray } from "./array.js";
import { isIterable } from "./iterate.js";

/** Any readonly objet. */
export type ImmutableObject<K extends PropertyKey = PropertyKey, T = unknown> = { readonly [KK in K]: T };

/** Any writable object. */
export type MutableObject<K extends PropertyKey = PropertyKey, T = unknown> = { [KK in K]: T };

/** Prop for an object. */
export type ObjectProp<T extends ImmutableObject = ImmutableObject> = readonly [keyof T, T[keyof T]];

/** Key for an object prop. */
export type ObjectKey<T extends ImmutableObject = ImmutableObject> = keyof T;

/** Value for an object prop. */
export type ObjectValue<T extends ImmutableObject = ImmutableObject> = T[keyof T];

/** Is an unknown value an unknown object? */
export const isObject = <T extends ImmutableObject>(value: T | unknown): value is T => typeof value === "object" && value !== null;

/** Assert that a value is an object */
export function assertObject(value: ImmutableObject | unknown): asserts value is ImmutableObject {
	if (!isObject(value)) throw new AssertionError(`Must be object`, value);
}

/** is an unknown value an unknown plain object? */
export function isPlainObject(value: ImmutableObject | unknown): value is ImmutableObject {
	if (isObject(value)) {
		const proto = Object.getPrototypeOf(value);
		return proto === null || proto === Object.prototype;
	}
	return false;
}

/** Assert that a value is an object */
export function assertPlainObject(value: ImmutableObject | unknown): asserts value is ImmutableObject {
	if (!isPlainObject(value)) throw new AssertionError(`Must be plain object`, value);
}

/** Is an unknown value the key for an own prop of an object. */
export const isProp = <T extends ImmutableObject>(obj: T, key: keyof T | unknown): key is keyof T => Object.prototype.hasOwnProperty.call(obj, key as PropertyKey);

/**
 * Mutable type is the opposite of `Readonly<T>` helper type.
 * - See https://github.com/microsoft/TypeScript/issues/24509
 * - Consistency with `Readonly<T>`
 */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Deep partial object: deeply convert an object to its partial version.
 * - Any value that extends `UnknownObject` has its props made partial.
 * - Works deeply on nested objects too.
 */
export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

/**
 * Deep mutable object: deeply convert an object to its mutable version.
 * - Any value that extends `UnknownObject` has its props made mutable.
 * - Works deeply on nested objects too.
 */
export type DeepMutable<T> = { -readonly [K in keyof T]: DeepMutable<T[K]> };

/**
 * Deep readonly object: deeply convert an object to its readonly version.
 * - Any value that extends `UnknownObject` has its props made readonly.
 * - Works deeply on nested objects too.
 */
export type DeepReadonly<T> = { +readonly [K in keyof T]: DeepReadonly<T[K]> };

/** Pick only the properties of an object that match a type. */
export type PickProps<T, TT> = Pick<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>;

/** Omit the properties of an object that match a type. */
export type OmitProps<T, TT> = Omit<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>;

/** Get the props of an object as a set of entries. */
export function getProps<T extends ImmutableObject>(obj: T): ImmutableArray<ObjectProp<T>>;
export function getProps<T extends ImmutableObject>(obj: T | Partial<T>): ImmutableArray<ObjectProp<T>>;
export function getProps<T extends ImmutableObject>(obj: T | Partial<T> | Iterable<ObjectProp<T>>): Iterable<ObjectProp<T>>;
export function getProps(obj: ImmutableObject | Partial<ImmutableObject> | Iterable<ObjectProp<ImmutableObject>>): Iterable<ObjectProp<ImmutableObject>> {
	return isIterable(obj) ? obj : Object.entries(obj);
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

/** Set a prop on an object (immutably) and return a new object including that prop. */
export function withProp<T extends ImmutableObject, K extends keyof T>(input: T, key: K, value: T[K]): T {
	return input[key] === value ? input : { ...input, [key]: value };
}

/** Set several props on an object (immutably) and return a new object including those props. */
export function withProps<T extends ImmutableObject>(input: T, props: T | Partial<T> | Iterable<ObjectProp<T>>): T {
	for (const [k, v] of getProps(props)) if (input[k] !== v) return { ...input, ...props };
	return input;
}

/** Remove several props from an object (immutably) and return a new object without those props. */
export function omitProps<T extends ImmutableObject, K extends keyof T>(input: T, ...keys: K[]): Omit<T, K>;
export function omitProps(input: ImmutableObject, ...keys: (keyof ImmutableObject)[]): ImmutableObject {
	for (const key of keys) if (key in input) return Object.fromEntries(Object.entries(input).filter(_hasntKey, keys));
	return input;
}
function _hasntKey<T extends ImmutableObject>(this: (keyof T)[], [key]: readonly [keyof T, T[keyof T]]): boolean {
	return !this.includes(key);
}

/** Pick several props from an object and return a new object with only thos props. */
export function pickProps<T extends ImmutableObject, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;
export function pickProps(input: ImmutableObject, ...keys: (keyof ImmutableObject)[]): ImmutableObject {
	return Object.fromEntries(Object.entries(input).filter(_hasKey, keys));
}
function _hasKey<T extends ImmutableObject>(this: (keyof T)[], [key]: readonly [keyof T, T[keyof T]]): boolean {
	return this.includes(key);
}

/** Set a single named prop on an object (by reference) and return its value. */
export function setProp<T extends MutableObject, K extends keyof T>(obj: T, key: K, value: T[K]): T[K] {
	obj[key] = value;
	return value;
}

/** Set several named props on an object (by reference). */
export function setProps<T extends MutableObject>(obj: T, entries: T | Partial<T> | Iterable<ObjectProp<T>>): void {
	for (const [k, v] of getProps<T>(entries)) obj[k] = v;
}

/** Remove several key/value entries from an object (by reference). */
export function deleteProps<T extends MutableObject>(obj: T, ...keys: (keyof T)[]): void {
	for (const key of keys) delete obj[key];
}

/**
 * Format an unknown object as a string.
 * - Use the custom `.toString()` function if it exists (don't use built in `Object.prototype.toString` because it's useless.
 * - Use `.title` or `.name` or `.id` if they exist and are strings.
 * - Use `Object` otherwise.
 */
export function formatObject(obj: ImmutableObject): string {
	const toString = obj.toString;
	if (typeof toString === "function" && toString !== Object.prototype.toString) return obj.toString();
	const name = obj.name;
	if (typeof name === "string") return name;
	const title = obj.title;
	if (typeof title === "string") return title;
	const id = obj.id;
	if (typeof id === "string") return id;
	return "Object";
}
