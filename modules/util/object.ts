import type { Entry, ImmutableEntries } from "./entry.js";
import type { Resolvable } from "./data.js";
import type { ImmutableArray } from "./array.js";
import { isIterable } from "./array.js";
import { SKIP } from "./constants.js";
import { isAsync } from "./promise.js";

/**
 * Empty object: an object with no properties.
 * - Use this as a type when you want to represent an empty object.
 * - Never use `{}` to represent empty objects because all objects and arrays and functions can extend it.
 */
export type EmptyObject = { readonly [key in never]: never };

/**
 * Immutable object: an object that cannot be modified.
 * - Cleaner than using `Record<string, T | undefined>`
 * - Consistency with `ImmutableArray<T>`
 * - Very useful as a generic type to allow more-specific extension.
 * - Never use `{}` to represent empty objects because all objects and arrays and functions can extend it.
 */
export type ImmutableObject<T = unknown> = { readonly [key: string]: T };

/**
 * Mutable object: an object that can be modified.
 * - Cleaner than using `Record<string, T | undefined>`
 * - Consistency with `ImmutableObject<T>` and `MutableArray<T>`
 */
export type MutableObject<T = unknown> = { [key: string]: T };

/**
 * Resolvable object: an object whose properties can be resolved with `resolveObject()`
 * - Property values can be `SKIP` symbol (and they will be removed).
 * - Property values can be `Promise` instances (and they will be awaited).
 */
export type ResolvableObject<T = unknown> = { readonly [key: string]: Resolvable<T> };

/**
 * Object type: extract the type for the props of an object.
 * - Consistency with builtin `ReturnType<T>`
 */
export type ObjectType<T extends ImmutableObject> = T[keyof T & string];

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
 * - Only works for plain objects (i.e. objects that extend `UnknownObject`), not arrays and functions.
 */
export type DeepPartial<T extends ImmutableObject> = { [K in keyof T]?: T[K] extends ImmutableObject ? DeepPartial<T[K]> : T[K] };

/**
 * Deep mutable object: deeply convert an object to its mutable version.
 * - Any value that extends `UnknownObject` has its props made mutable.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `UnknownObject`), not arrays and functions.
 */
export type DeepMutable<T extends ImmutableObject> = { -readonly [K in keyof T]: T[K] extends ImmutableObject ? DeepMutable<T[K]> : T[K] };

/**
 * Deep readonly object: deeply convert an object to its readonly version.
 * - Any value that extends `UnknownObject` has its props made readonly.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `UnknownObject`), not arrays and functions.
 */
export type DeepReadonly<T extends ImmutableObject> = { +readonly [K in keyof T]: T[K] extends ImmutableObject ? DeepReadonly<T[K]> : T[K] };

/**
 * Entry for a prop in an object.
 * - Only string props are included.
 */
export type PropEntry<T extends ImmutableObject> = readonly [keyof T & string, T[keyof T & string]];

/**
 * Is a value an unknown object?
 * - This is a TypeScript assertion object that asserts the value extends `UnknownObject`
 * - Note: Arrays and other complex objects will return true.
 */
export const isObject = <T extends ImmutableObject>(value: T | unknown): value is T => typeof value === "object" && value !== null;

/** Is a value a plain object? */
export const isPlainObject = <T extends ImmutableObject>(value: T | unknown): value is T => isObject(value) && value.constructor === Object;

/**
 * Turn an array of entries into an object.
 * - Eventually when browser support is good enough this can be changed to ES2019's `Object.fromEntries()`
 */
export const objectFromEntries = <V>(entries: Iterable<Entry<V>>): MutableObject<V> => {
	// Builtin is probably faster (if it exists).
	if (Object.fromEntries) return Object.fromEntries<V>(entries);
	// Otherwise build the object manually.
	const output: MutableObject<V> = {};
	for (const [k, v] of entries) output[k] = v;
	return output;
};

/** Extract a date property from an object. */
export const getObjectDate = <V extends { date?: unknown }>(obj: V): V["date"] => obj.date;

/** Extract an order property from an object. */
export const getObjectOrder = <V extends { order?: unknown }>(obj: V): V["order"] => obj.order;

/** Extract a title property from an object. */
export const getObjectTitle = <V extends { title?: unknown }>(obj: V): V["title"] => obj.title;

/** Extract a name property from an object. */
export const getObjectName = <V extends { name?: unknown }>(obj: V): V["name"] => obj.name;

/** Get the first entry from an object or array. */
export const getFirstProp = <T>(obj: ImmutableObject<T>): Entry<T> | undefined => Object.entries(obj).shift();

/** Get the last entry from an object or array. */
export const getLastProp = <T>(obj: ImmutableObject<T>): Entry<T> | undefined => Object.entries(obj).pop();

/**
 * Map the (own) keys of an object (i.e. to rename the keys).
 *
 * @param input An input object whose keys you want to rename.
 *
 * @param mapper Mapping function that receives the key and value, and returns the new key.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Note inverted argument order in mapper from `mapObject()` (because this is almost certainly what you want.
 *
 * @returns The mapped object.
 * - Immutable so if the values don't change then the same instance will be returned.
 */
export function mapKeys<V extends unknown>(
	input: ImmutableObject<V> | Iterable<Entry<V>>, //
	mapper: (key: string, value: V) => typeof SKIP | string,
): ImmutableObject<V>;
export function mapKeys(
	input: ImmutableObject | Iterable<Entry>, //
	mapper: (key: string, value: unknown) => typeof SKIP | string,
): ImmutableObject {
	let changed = false;
	const output: MutableObject = {};
	for (const [current, value] of getProps(input)) {
		const next = mapper(current, value);
		if (next !== SKIP) output[next] = value;
		if (next !== current) changed = true;
	}
	return changed || isIterable(input) ? output : input;
}

/**
 * Map the key/value entries of an object (i.e. to change the values).
 *
 * @param input An input object whose property values you want to modify.
 *
 * @param mapper Mapping function that receives the key and returns the new value.
 * - Mapper can return a promise. If it does will return a Promise that resolves once every value has resolved.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Mapper can be a static value and all the values will be set to that value.
 *
 * @returns The mapped object.
 * - Immutable so if the values don't change then the same instance will be returned.
 * - Prototype of the object will be the same as the input object.
 */
export function mapProps<I, O>(
	input: ImmutableObject<I> | Iterable<Entry<I>>, //
	mapper: (value: I, key: string) => Promise<typeof SKIP | O>,
): Promise<ImmutableObject<O>>;
export function mapProps<I, O>(
	input: ImmutableObject<I> | Iterable<Entry<I>>, //
	mapper: ((value: I, key: string) => typeof SKIP | O) | O,
): ImmutableObject<O>;
export function mapProps(
	input: ImmutableObject | Iterable<Entry>,
	mapper: ((value: unknown, key: string) => Resolvable<unknown>) | Resolvable<unknown>,
): ImmutableObject | Promise<ImmutableObject> {
	let promises = false;
	let changed = false;
	const output: MutableObject<Resolvable<unknown>> = {};
	for (const [key, current] of getProps(input)) {
		const next = typeof mapper === "function" ? mapper(current, key) : mapper;
		if (isAsync(next)) promises = true;
		if (next !== SKIP) output[key] = next;
		if (next !== current) changed = true;
	}
	return promises ? resolveObject(output) : changed || isIterable(input) ? output : input;
}

/**
 * Map an entire object from an exact object type to an exact other object type with a mapper function.
 * - This is a copy of `mapProps()` but with different generics that allow you to specify the exact input and output types.
 * - It can't be an overload of `mapObject()` because the overloads are too similar and there's no way for TypeScript to distinguish between them.
 */
export const mapObject: <I extends ImmutableObject, O extends ImmutableObject>(
	input: I, //
	mapper: (value: I[string], key: string) => O[string],
) => O = mapProps;

/**
 * Map an array of object keys into an object using a mapper function or a single value.
 *
 * @param keys An array of keys to map into an object.
 *
 * @param mapper Mapping function that receives the key and returns the corresponding value.
 * - Mapper can return a promise. If it does will return a Promise that resolves once every value has resolved.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Mapper can be a static value and all the values will be set to that value.
 *
 * @returns The mapped object.
 * - Immutable so if the values don't change then the same instance will be returned.
 */
export function objectFromKeys<O>(
	keys: Iterable<string>, //
	mapper: (key: string) => Promise<typeof SKIP | O>,
): Promise<ImmutableObject<O>>;
export function objectFromKeys<O>(
	keys: Iterable<string>, //
	mapper: ((key: string) => typeof SKIP | O) | O,
): ImmutableObject<O>;
export function objectFromKeys<O>(
	keys: Iterable<string>, //
	mapper: ((key: string) => typeof SKIP | O) | O,
): ImmutableObject<O> | Promise<ImmutableObject<O>>;
export function objectFromKeys(
	keys: Iterable<string>, //
	mapper: ((key: string) => Resolvable<unknown>) | Resolvable<unknown>,
): ImmutableObject | Promise<ImmutableObject> {
	let promises = false;
	const output: MutableObject<Resolvable<unknown>> = {};
	for (const key of keys) {
		const next = typeof mapper === "function" ? mapper(key) : mapper;
		if (isAsync(next)) promises = true;
		if (next !== SKIP) output[key] = next;
	}
	return promises ? resolveObject(output) : output;
}

/**
 * Resolve the property values in an object.
 *
 * @param input The input object.
 * - Any values that are `Promise` instances will be awaited.
 * - Any values that are the `SKIP` symbol will not be included in the output object.
 *
 * @returns Object containing resolved property values.
 */
export async function resolveObject<T>(input: ImmutableObject<Resolvable<T>> | ImmutableEntries<Resolvable<T>>): Promise<MutableObject<T>> {
	const output: MutableObject<T> = {};
	const entries = input instanceof Array ? input : Object.entries(input);
	await Promise.all(
		entries.map(async ([k, a]) => {
			const v = await a;
			if (v !== SKIP) output[k] = v;
		}),
	);
	return output;
}

/**
 * Extract a named prop from an object.
 * - Extraction is possibly deep if deeper keys are specified.
 *
 * @param obj The target object to get from.
 * @param k1 The key of the prop in the object to get.
 * @param k2 The sub-key of the prop in the object to get.
 * @param k3 The sub-sub-key of the prop in the object to get.
 * @param k4 The sub-sub-sub-key of the prop in the object to get.
 */
export function getProp<T extends ImmutableObject, K1 extends keyof T & string, K2 extends keyof T[K1] & string, K3 extends keyof T[K1][K2] & string, K4 extends keyof T[K1][K2][K3] & string>(obj: T, k1: K1, k2: K2, k3: K3, k4: K4): T[K1][K2][K3][K4]; // prettier-ignore
export function getProp<T extends ImmutableObject, K1 extends keyof T & string, K2 extends keyof T[K1] & string, K3 extends keyof T[K1][K2] & string>(obj: T, k1: K1, k2: K2, k3: K3): T[K1][K2][K3]; // prettier-ignore
export function getProp<T extends ImmutableObject, K1 extends keyof T & string, K2 extends keyof T[K1]>(obj: T, k1: K1, k2: K2): T[K1][K2]; // prettier-ignore
export function getProp<T extends ImmutableObject, K1 extends keyof T & string>(obj: T, k1: K1): T[K1];
export function getProp<
	T extends ImmutableObject,
	K1 extends keyof T & string,
	K2 extends keyof T[K1] & string,
	K3 extends keyof T[K1][K2] & string,
	K4 extends keyof T[K1][K2][K3] & string,
>(obj: T, k1: K1, k2?: K2, k3?: K3, k4?: K4): T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4] {
	return !k2 ? obj[k1] : !k3 ? obj[k1][k2] : !k4 ? obj[k1][k2][k3] : obj[k1][k2][k3][k4];
}

/**
 * Extract the value for an entry in a map-like object.
 *
 * @param obj The target object to get from.
 * @param key The key of the entry in the object to get.
 */
export function getEntry<T>(obj: ImmutableObject<T>, key: string): T | undefined {
	return obj[key];
}

/**
 * Get all the entries for the props of an object.
 *
 * @param obj The target object to get the props of.
 * @return Iterable set of entries for the object.
 * - Only entries with string keys are included.
 */
export function getProps<T extends ImmutableObject>(obj: T): ImmutableArray<PropEntry<T>>;
export function getProps<T extends ImmutableObject>(obj: T | Partial<T> | Iterable<PropEntry<T>>): Iterable<PropEntry<T>>;
export function getProps<T extends ImmutableObject>(obj: T | Partial<T> | Iterable<PropEntry<T>>): Iterable<PropEntry<T>> {
	return isIterable(obj) ? obj : (Object.entries(obj) as ImmutableArray<PropEntry<T>>);
}

/**
 * Set the property of an object with a known shape.
 *
 * @param input The input object.
 * @param key The key of the prop to set.
 * @param value The value of the prop to set.
 *
 * @return New object with the specified prop set.
 * - If `key` already exists in `obj` and is exactly the same (using `===`) then the exact same input object will be returned.
 */
export function withProp<T extends ImmutableObject>(input: T, key: string & keyof T, value: T[string & keyof T]): T;
export function withProp<T extends ImmutableObject, K extends string, V>(input: T, key: string, value: V): T & { [KK in K]: V };
export function withProp<T extends ImmutableObject, K extends string, V>(input: T, key: string, value: V): T & { [KK in K]: V } {
	if (key in input && input[key] === value) return input as T & { [KK in K]: V };
	return { ...input, [key]: value };
}

/**
 * Set several properties of an object with a known shape.
 *
 * @param input The input object.
 *
 * @return New object with the specified prop added.
 * - If every prop already exists and has the same value the exact same input object will be returned.
 */
export function withProps<T extends ImmutableObject>(input: T, props: Partial<T>): T;
export function withProps<T extends ImmutableObject, P extends ImmutableObject>(input: T, props: P): T & P;
export function withProps<T extends ImmutableObject>(input: T, props: Partial<T> | Iterable<PropEntry<T>>): T {
	let changed = false;
	const output = { ...input };
	for (const [key, value] of getProps(props))
		if (input[key] !== value) {
			output[key] = value;
			changed = true;
		}
	return changed ? output : input;
}

/**
 * Add a key/value entry to a map-like object (immutably).
 *
 * @param input The input object.
 * @param key The key of the entry to add.
 * @param value The value of the entry to add.
 *
 * @return New map-like object with the specified entry added.
 */
export const withEntry: <T>(input: ImmutableObject<T>, key: string, value: T) => ImmutableObject<T> = withProp;

/**
 * Add several a key/value enties to a map-like object (immutably).
 *
 * @param input The input object.
 * @param entries The set of entries to add to the map-like object in either `{ key: value }` object format or as an iterable list of entries in `[key, value]` format.
 *
 * @return New object with the specified entry.
 */
export const withEntries: <T>(input: ImmutableObject<T>, entries: ImmutableObject<T> | Iterable<Entry<T>>) => ImmutableObject<T> = withProps;

/**
 * Remove a key/value entry from a map-like object (immutably).
 *
 * @param input The input object.
 * @param key The key of the entry to remove.
 * @param value The value of the entry to remove. If set, the entry will only be removed if its current value is exactly `value`
 *
 * @return New object without the specified prop.
 * - If `key` doesn't already exist in `obj` then the exact same input object will be returned.
 */
export function withoutEntry<T>(input: ImmutableObject<T>, key: string, value?: T): ImmutableObject<T> {
	if (!(key in input)) return input;
	if (value !== undefined && input[key] !== value) return input;
	const { [key]: unused, ...output } = input; // eslint-disable-line @typescript-eslint/no-unused-vars
	return output;
}

/**
 * Remove several key/value entries from a map-like object (immutably).
 *
 * @param input The input object.
 * @param keys Array of keys of entries to remove.
 *
 * @return New object without the specified props.
 * - If every prop already exists and has the same value the exact same input object will be returned.
 */
export function withoutEntries<T>(input: ImmutableObject<T>, keys: Iterable<string>): ImmutableObject<T> {
	let changed = false;
	const output: MutableObject<T> = { ...input };
	for (const key of keys)
		if (key in input) {
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
export function setProp<T extends MutableObject, K extends keyof T>(obj: T, key: K, value: T[K]): void {
	obj[key] = value;
}

/**
 * Set several named props on an object with a known shape (by reference).
 *
 * @param obj The target object to modify.
 * @param props An object containing new props to set on the object.
 */
export function setProps<T extends MutableObject>(obj: T, props: Partial<T> | Iterable<PropEntry<T>>): void {
	for (const [k, v] of getProps(props)) obj[k] = v;
}

/**
 * Add a key/value entry to a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param key The key of the entry to add.
 * @param value The value of the entry. If the object's property isn't exactly this value, it won't be removed.
 */
export const addEntry: <T>(obj: MutableObject<T>, key: string | number, value: T) => void = setProp;

/**
 * Add several key/value entries to a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param key The key of the entry to add.
 * @param value The value of the entry. If the object's property isn't exactly this value, it won't be removed.
 */
export const addEntries: <T>(obj: MutableObject<T>, entries: ImmutableObject<T> | Iterable<Entry<T>>) => void = setProps;

/**
 * Remove a key/value entry from a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param key The key of the entry to remove.
 * @param value The value of the entry to remove. If set, the entry will only be removed if its current value is exactly `value`
 */
export function removeEntry<T>(obj: MutableObject<T>, key: string | number, value?: T): void {
	if (value === undefined || obj[key] === value) delete obj[key];
}

/**
 * Remove several key/value entries from a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param key The key of the entry to add.
 * @param value The value of the entry. If the object's property isn't exactly this value, it won't be removed.
 */
export function removeEntries<T>(obj: MutableObject<T>, keys: Iterable<string>): void {
	for (const key of keys) delete obj[key];
}
