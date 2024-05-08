import { ValueError } from "../error/ValueError.js";
import type { ImmutableArray } from "./array.js";
import { isIterable } from "./iterate.js";

/** Any readonly object. */
export type ImmutableObject<K extends PropertyKey = PropertyKey, T = unknown> = { readonly [KK in K]: T };

/** Any writable object. */
export type MutableObject<K extends PropertyKey = PropertyKey, T = unknown> = { [KK in K]: T };

/** Prop for an object. */
export type Prop<T> = readonly [keyof T, T[keyof T]];

/** Key for an object prop. */
export type Key<T> = keyof T;

/** Value for an object prop. */
export type Value<T> = T[keyof T];

/** Something that can be converted to an object. */
export type PossibleObject<T> = T | Iterable<Prop<T>>;

/** Is an unknown value an unknown object? */
export function isObject(value: unknown): value is ImmutableObject {
	return typeof value === "object" && value !== null;
}

/** Assert that a value is an object */
export function assertObject(value: unknown): asserts value is ImmutableObject {
	if (!isObject(value)) throw new ValueError("Must be object", value);
}

/** Is an unknown value a plain object? */
export function isPlainObject(value: unknown): value is ImmutableObject {
	if (isObject(value)) {
		const proto = getPrototype(value);
		return proto === null || proto === Object.prototype;
	}
	return false;
}

/** Assert that an unknown value is a plain object */
export function assertPlainObject(value: unknown): asserts value is ImmutableObject {
	if (!isPlainObject(value)) throw new ValueError("Must be plain object", value);
}

/** Is an unknown value the key for an own prop of an object. */
export const isProp = <T extends ImmutableObject>(obj: T, key: PropertyKey): key is keyof T => Object.hasOwn(obj, key);

/** Assert that an unknown value is the key for an own prop of an object. */
export function assertProp<T extends ImmutableObject>(obj: T, key: PropertyKey): asserts key is keyof T {
	if (!isProp(obj, key)) throw new ValueError("Must be object prop", key);
}

/** Turn a possible object into an object. */
export function getObject<T extends ImmutableObject>(obj: PossibleObject<T>): T {
	return isIterable(obj) ? (Object.fromEntries(obj) as T) : obj;
}

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
export function getProps<T>(obj: T): ImmutableArray<Prop<T>>;
export function getProps<T>(obj: T | Partial<T>): ImmutableArray<Prop<T>>;
export function getProps<T>(obj: T | Partial<T> | Iterable<Prop<T>>): Iterable<Prop<T>>;
export function getProps(
	obj: ImmutableObject | Partial<ImmutableObject> | Iterable<Prop<ImmutableObject>>,
): Iterable<Prop<ImmutableObject>> {
	return isIterable(obj) ? obj : Object.entries(obj);
}

/** Get the keys of an object as an array. */
export function getKeys<T>(obj: T): ImmutableArray<Key<T>>;
export function getKeys<T>(obj: T | Partial<T>): ImmutableArray<Key<T>>;
export function getKeys<T>(obj: T | Partial<T> | Iterable<Key<T>>): Iterable<Key<T>>;
export function getKeys(obj: ImmutableObject | Partial<ImmutableObject> | Iterable<Key<ImmutableObject>>): Iterable<Key<ImmutableObject>> {
	return isIterable(obj) ? obj : Object.keys(obj);
}

/** Extract the value of a named prop from an object. */
export function getProp<T, K extends Key<T>>(obj: T, key: K): T[K] {
	return obj[key];
}

/** Create an object from a single prop. */
export function fromProp<K extends PropertyKey, V>(key: K, value: V): { readonly [KK in K]: V } {
	return { [key]: value } as { readonly [KK in K]: V };
}

/** Set a prop on an object (immutably) and return a new object including that prop. */
export function withProp<T extends ImmutableObject, K extends Key<T>>(input: T, key: K, value: T[K]): T {
	return input[key] === value ? input : { __proto__: getPrototype(input), ...input, [key]: value };
}

/** Set several props on an object (immutably) and return a new object including those props. */
export function withProps<T>(input: T, props: Partial<T>): T;
export function withProps<T>(input: T, props: T | Partial<T> | Iterable<Prop<T>>): T;
export function withProps<T>(input: T, props: T | Partial<T> | Iterable<Prop<T>>): T {
	for (const [k, v] of getProps(props)) if (input[k] !== v) return { __proto__: getPrototype(input), ...input, ...props };
	return input;
}

/** Remove several props from an object (immutably) and return a new object without those props. */
export function omitProps<T, K extends Key<T>>(input: T, ...keys: K[]): Omit<T, K>;
export function omitProps(input: ImmutableObject, ...keys: (keyof ImmutableObject)[]): ImmutableObject {
	for (const key of keys) if (key in input) return Object.fromEntries(Object.entries(input).filter(_hasntKey, keys));
	return input;
}
function _hasntKey<T extends ImmutableObject>(this: Key<T>[], [key]: Prop<T>): boolean {
	return !this.includes(key);
}

/** Pick several props from an object and return a new object with only thos props. */
export function pickProps<T, K extends Key<T>>(obj: T, ...keys: K[]): Pick<T, K>;
export function pickProps(input: ImmutableObject, ...keys: (keyof ImmutableObject)[]): ImmutableObject {
	return Object.fromEntries(Object.entries(input).filter(_hasKey, keys));
}
function _hasKey<T extends ImmutableObject>(this: Key<T>[], [key]: readonly [Key<T>, T[Key<T>]]): boolean {
	return this.includes(key);
}

/** Set a single named prop on an object (by reference) and return its value. */
export function setProp<T extends MutableObject, K extends Key<T>>(obj: T, key: K, value: T[K]): T[K] {
	obj[key] = value;
	return value;
}

/** Set several named props on an object (by reference). */
export function setProps<T extends MutableObject>(obj: T, entries: T | Partial<T> | Iterable<Prop<T>>): void {
	for (const [k, v] of getProps<T>(entries)) obj[k] = v;
}

/** Remove several key/value entries from an object (by reference). */
export function deleteProps<T extends MutableObject>(obj: T, ...keys: Key<T>[]): void {
	for (const key of keys) delete obj[key];
}

/**
 * Format an unknown object as a string.
 * - Use the custom `.toString()` function if it exists (don't use built in `Object.prototype.toString` because it's useless.
 * - Use `.title` or `.name` or `.id` if they exist and are strings.
 * - Use `Object` otherwise.
 */
export function formatObject(obj: ImmutableObject): string {
	if (typeof obj.toString === "function" && obj.toString !== Object.prototype.toString) return obj.toString();
	const name = obj.name;
	if (typeof name === "string") return name;
	const title = obj.title;
	if (typeof title === "string") return title;
	const id = obj.id;
	if (typeof id === "string") return id;
	return "Object";
}

/**
 * Get the prototype of an object instance.
 * - Recommend to use this because Typescript's default lib specifies `Object.getPrototypeOf()` returning `any`.
 */
export function getPrototype<T>(obj: T): Partial<T> | null {
	return Object.getPrototypeOf(obj) as Partial<T> | null;
}

/** Shallow clone an object with the same prototype. */
export function cloneObject<T>(input: T): T {
	return { __proto__: getPrototype(input), ...input };
}

/** Shallow clone an object with a single changed value. */
export function cloneObjectWith<T, K extends Key<T>>(input: T, key: K, value: T[K]): T;
export function cloneObjectWith<T, K extends string, V>(input: T, key: K, value: V): T & { [KK in K]: V };
export function cloneObjectWith<T, K extends Key<T>>(input: T, key: K, value: T[K]): T {
	return input[key] === value ? input : { __proto__: getPrototype(input), ...input, [key]: value };
}
