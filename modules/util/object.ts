import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import { isIterable } from "./iterate.js";

/**
 * Any readonly object.
 *
 * @see https://shelving.cc/util/object/ImmutableObject
 */
export type ImmutableObject<K extends PropertyKey = PropertyKey, T = unknown> = { readonly [KK in K]: T };

/**
 * Any writable object.
 *
 * @see https://shelving.cc/util/object/MutableObject
 */
export type MutableObject<K extends PropertyKey = PropertyKey, T = unknown> = { [KK in K]: T };

/**
 * Prop for an object, as a readonly key/value entry tuple.
 *
 * @see https://shelving.cc/util/object/Prop
 */
export type Prop<T> = readonly [keyof T, T[keyof T]];

/**
 * Key for an object prop.
 *
 * @see https://shelving.cc/util/object/Key
 */
export type Key<T> = keyof T;

/**
 * Value for an object prop.
 *
 * @see https://shelving.cc/util/object/Value
 */
export type Value<T> = T[keyof T];

/**
 * Something that can be converted to an object.
 * - Either the object itself, or an iterable set of key/value entry tuples.
 *
 * @see https://shelving.cc/util/object/PossibleObject
 */
export type PossibleObject<T> = T | Iterable<Prop<T>>;

/**
 * Is an unknown value an unknown object?
 *
 * @param value The value to test.
 * @returns `true` if `value` is a non-null `object`, narrowing its type.
 * @see https://shelving.cc/util/object/isObject
 */
export function isObject(value: unknown): value is ImmutableObject {
	return typeof value === "object" && value !== null;
}

/**
 * Assert that a value is an object.
 *
 * @param value The value to assert.
 * @throws {RequiredError} If `value` is not an `object`.
 * @see https://shelving.cc/util/object/assertObject
 */
export function assertObject(value: unknown): asserts value is ImmutableObject {
	if (!isObject(value)) throw new RequiredError("Must be object", { received: value, caller: assertObject });
}

/**
 * Is an unknown value a plain object?
 * - A plain object is one whose prototype is `Object.prototype` or `null` (i.e. not a class instance).
 *
 * @param value The value to test.
 * @returns `true` if `value` is a plain object, narrowing its type.
 * @see https://shelving.cc/util/object/isPlainObject
 */
export function isPlainObject(value: unknown): value is ImmutableObject {
	if (isObject(value)) {
		const proto = getPrototype(value);
		return proto === null || proto === Object.prototype;
	}
	return false;
}

/**
 * Assert that an unknown value is a plain object.
 *
 * @param value The value to assert.
 * @throws {RequiredError} If `value` is not a plain object.
 * @see https://shelving.cc/util/object/assertPlainObject
 */
export function assertPlainObject(value: unknown): asserts value is ImmutableObject {
	if (!isPlainObject(value)) throw new RequiredError("Must be plain object", { received: value, caller: assertPlainObject });
}

/**
 * Is an unknown value the key for an own prop of an object.
 *
 * @param obj The object to test against.
 * @param key The key to test for.
 * @returns `true` if `key` is an own prop of `obj`, narrowing its type.
 * @see https://shelving.cc/util/object/isProp
 */
export function isProp<T extends ImmutableObject>(obj: T, key: PropertyKey): key is keyof T {
	return Object.hasOwn(obj, key);
}

/**
 * Assert that an unknown value is the key for an own prop of an object.
 *
 * @param obj The object to assert against.
 * @param key The key to assert is an own prop.
 * @throws {RequiredError} If `key` is not an own prop of `obj`.
 * @see https://shelving.cc/util/object/assertProp
 */
export function assertProp<T extends ImmutableObject>(obj: T, key: PropertyKey): asserts key is keyof T {
	if (!isProp(obj, key)) throw new RequiredError("Key must exist in object", { key, obj, caller: assertProp });
}

/**
 * Turn a possible object into an object.
 * - If the value is iterable it is converted to an object using `Object.fromEntries()`, otherwise it is returned as-is.
 *
 * @param obj The object or iterable set of key/value entry tuples to convert.
 * @returns The corresponding object.
 * @see https://shelving.cc/util/object/getObject
 */
export function getObject<T extends ImmutableObject>(obj: PossibleObject<T>): T {
	return isIterable(obj) ? (Object.fromEntries(obj) as T) : obj;
}

/**
 * Mutable type is the opposite of `Readonly<T>` helper type.
 * - See https://github.com/microsoft/TypeScript/issues/24509
 * - Consistency with `Readonly<T>`
 *
 * @see https://shelving.cc/util/object/Mutable
 */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Deep partial object: deeply convert an object to its partial version.
 * - Any value that extends `UnknownObject` has its props made partial.
 * - Works deeply on nested objects too.
 *
 * @see https://shelving.cc/util/object/DeepPartial
 */
export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

/**
 * Deep mutable object: deeply convert an object to its mutable version.
 * - Any value that extends `UnknownObject` has its props made mutable.
 * - Works deeply on nested objects too.
 *
 * @see https://shelving.cc/util/object/DeepMutable
 */
export type DeepMutable<T> = { -readonly [K in keyof T]: DeepMutable<T[K]> };

/**
 * Deep readonly object: deeply convert an object to its readonly version.
 * - Any value that extends `UnknownObject` has its props made readonly.
 * - Works deeply on nested objects too.
 *
 * @see https://shelving.cc/util/object/DeepReadonly
 */
export type DeepReadonly<T> = { +readonly [K in keyof T]: DeepReadonly<T[K]> };

/**
 * Pick only the properties of an object that match a type.
 *
 * @see https://shelving.cc/util/object/PickProps
 */
export type PickProps<T, TT> = Pick<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>;

/**
 * Omit the properties of an object that match a type.
 *
 * @see https://shelving.cc/util/object/OmitProps
 */
export type OmitProps<T, TT> = Omit<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>;

/**
 * Get the props of an object as a set of entries.
 *
 * @param obj The object to read the props from.
 * @returns Iterable set of key/value entry tuples for the object.
 * @see https://shelving.cc/util/object/getProps
 */
export function getProps<T>(obj: T): ImmutableArray<Prop<T>>;
export function getProps<T>(obj: T | Partial<T>): ImmutableArray<Prop<T>>;
export function getProps<T>(obj: T | Partial<T> | Iterable<Prop<T>>): Iterable<Prop<T>>;
export function getProps(
	obj: ImmutableObject | Partial<ImmutableObject> | Iterable<Prop<ImmutableObject>>,
): Iterable<Prop<ImmutableObject>> {
	return isIterable(obj) ? obj : Object.entries(obj);
}

/**
 * Get the keys of an object as an array.
 *
 * @param obj The object to read the keys from.
 * @returns Iterable set of keys for the object.
 * @see https://shelving.cc/util/object/getKeys
 */
export function getKeys<T>(obj: T): ImmutableArray<Key<T>>;
export function getKeys<T>(obj: T | Partial<T>): ImmutableArray<Key<T>>;
export function getKeys<T>(obj: T | Partial<T> | Iterable<Key<T>>): Iterable<Key<T>>;
export function getKeys(obj: ImmutableObject | Partial<ImmutableObject> | Iterable<Key<ImmutableObject>>): Iterable<Key<ImmutableObject>> {
	return isIterable(obj) ? obj : Object.keys(obj);
}

/**
 * Extract the value of a named prop from an object.
 *
 * @param obj The object to read the prop from.
 * @param key The key of the prop to read.
 * @returns The value of the named prop.
 * @see https://shelving.cc/util/object/getProp
 */
export function getProp<T, K extends Key<T>>(obj: T, key: K): T[K] {
	return obj[key];
}

/**
 * Create an object from a single prop.
 *
 * @param key The key of the prop to set.
 * @param value The value of the prop to set.
 * @returns A new object containing only the single prop.
 * @see https://shelving.cc/util/object/fromProp
 */
export function fromProp<K extends PropertyKey, V>(key: K, value: V): { readonly [KK in K]: V } {
	return { [key]: value } as { readonly [KK in K]: V };
}

/**
 * Set a prop on an object (immutably) and return a new object including that prop.
 * - If the value is unchanged the original object is returned unchanged.
 *
 * @param input The object to set the prop on.
 * @param key The key of the prop to set.
 * @param value The value of the prop to set.
 * @returns A new object including the set prop, or the original object if the value was unchanged.
 * @see https://shelving.cc/util/object/withProp
 */
export function withProp<T extends ImmutableObject, K extends Key<T>>(input: T, key: K, value: T[K]): T {
	return input[key] === value ? input : { __proto__: getPrototype(input), ...input, [key]: value };
}

/**
 * Set several props on an object (immutably) and return a new object including those props.
 * - If all values are unchanged the original object is returned unchanged.
 *
 * @param input The object to set the props on.
 * @param props The props to set, as an object or iterable set of key/value entry tuples.
 * @returns A new object including the set props, or the original object if all values were unchanged.
 * @see https://shelving.cc/util/object/withProps
 */
export function withProps<T>(input: T, props: Partial<T>): T;
export function withProps<T>(input: T, props: T | Partial<T> | Iterable<Prop<T>>): T;
export function withProps<T>(input: T, props: T | Partial<T> | Iterable<Prop<T>>): T {
	for (const [k, v] of getProps(props)) if (input[k] !== v) return { __proto__: getPrototype(input), ...input, ...props };
	return input;
}

/**
 * Remove several props from an object (immutably) and return a new object without those props.
 * - If none of the keys exist the original object is returned unchanged.
 *
 * @param input The object to remove the props from.
 * @param keys The keys of the props to remove.
 * @returns A new object without the removed props, or the original object if no keys were present.
 * @see https://shelving.cc/util/object/omitProps
 */
export function omitProps<T, K extends Key<T>>(input: T, ...keys: K[]): Omit<T, K>;
export function omitProps(input: ImmutableObject, ...keys: (keyof ImmutableObject)[]): ImmutableObject {
	if (!keys.length) return input;
	for (const key of keys) if (key in input) return Object.fromEntries(Object.entries(input).filter(_hasntKey, keys));
	return input;
}
function _hasntKey<T extends ImmutableObject>(this: Key<T>[], [key]: Prop<T>): boolean {
	return !this.includes(key);
}

/**
 * Remove a prop from an object (immutably) and return a new object without that prop.
 * - If the key doesn't exist the original object is returned unchanged.
 *
 * @param input The object to remove the prop from.
 * @param key The key of the prop to remove.
 * @returns A new object without the removed prop, or the original object if the key was not present.
 * @see https://shelving.cc/util/object/omitProp
 */
export const omitProp: <T, K extends Key<T>>(input: T, key: K) => Omit<T, K> = omitProps;

/**
 * Pick several props from an object and return a new object with only those props.
 *
 * @param obj The object to pick the props from.
 * @param keys The keys of the props to pick.
 * @returns A new object containing only the picked props.
 * @see https://shelving.cc/util/object/pickProps
 */
export function pickProps<T, K extends Key<T>>(obj: T, ...keys: K[]): Pick<T, K>;
export function pickProps(input: ImmutableObject, ...keys: (keyof ImmutableObject)[]): ImmutableObject {
	return Object.fromEntries(Object.entries(input).filter(_hasKey, keys));
}
function _hasKey<T extends ImmutableObject>(this: Key<T>[], [key]: readonly [Key<T>, T[Key<T>]]): boolean {
	return this.includes(key);
}

/**
 * Set a single named prop on an object (by reference) and return its value.
 *
 * @param obj The object to set the prop on (modified by reference).
 * @param key The key of the prop to set.
 * @param value The value of the prop to set.
 * @returns The value that was set.
 * @see https://shelving.cc/util/object/setProp
 */
export function setProp<T extends MutableObject, K extends Key<T>>(obj: T, key: K, value: T[K]): T[K] {
	obj[key] = value;
	return value;
}

/**
 * Set several named props on an object (by reference).
 *
 * @param obj The object to set the props on (modified by reference).
 * @param entries The props to set, as an object or iterable set of key/value entry tuples.
 * @see https://shelving.cc/util/object/setProps
 */
export function setProps<T extends MutableObject>(obj: T, entries: T | Partial<T> | Iterable<Prop<T>>): void {
	for (const [k, v] of getProps<T>(entries)) obj[k] = v;
}

/**
 * Remove several key/value entries from an object (by reference).
 *
 * @param obj The object to remove the props from (modified by reference).
 * @param keys The keys of the props to remove.
 * @see https://shelving.cc/util/object/deleteProps
 */
export function deleteProps<T extends MutableObject>(obj: T, ...keys: Key<T>[]): void {
	for (const key of keys) delete obj[key];
}

/**
 * Remove a key/value entry from an object (by reference).
 *
 * @param input The object to remove the prop from (modified by reference).
 * @param key The key of the prop to remove.
 * @see https://shelving.cc/util/object/deleteProp
 */
export const deleteProp: <T extends MutableObject>(input: T, key: Key<T>) => void = deleteProps;

/**
 * Get the prototype of an object instance.
 * - Recommend to use this because Typescript's default lib specifies `Object.getPrototypeOf()` returning `any`.
 *
 * @param obj The object to read the prototype from.
 * @returns The prototype of the object, or `null` if it has none.
 * @see https://shelving.cc/util/object/getPrototype
 */
export function getPrototype<T>(obj: T): Partial<T> | null {
	return Object.getPrototypeOf(obj) as Partial<T> | null;
}

/**
 * Shallow clone an object with the same prototype.
 *
 * @param input The object to clone.
 * @returns A new object with the same prototype and props as `input`.
 * @see https://shelving.cc/util/object/cloneObject
 */
export function cloneObject<T>(input: T): T {
	return { __proto__: getPrototype(input), ...input };
}

/**
 * Shallow clone an object with a single changed value.
 * - If the value is unchanged the original object is returned unchanged.
 *
 * @param input The object to clone.
 * @param key The key of the prop to change.
 * @param value The value of the prop to change.
 * @returns A new object with the changed prop, or the original object if the value was unchanged.
 * @see https://shelving.cc/util/object/cloneObjectWith
 */
export function cloneObjectWith<T, K extends Key<T>>(input: T, key: K, value: T[K]): T;
export function cloneObjectWith<T, K extends string, V>(input: T, key: K, value: V): T & { [KK in K]: V };
export function cloneObjectWith<T, K extends Key<T>>(input: T, key: K, value: T[K]): T {
	return input[key] === value ? input : { __proto__: getPrototype(input), ...input, [key]: value };
}
