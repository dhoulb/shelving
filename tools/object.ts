import { AssertionError } from "shelving/errors";
import type { Entry, ReadonlyEntries, ResolvableEntries } from "./entry";
import { SKIP } from "./constants";

/**
 * Keys: extract the key names of an object.
 * - Optionally filtered for those props where the value matches type `F`.
 * - Similar to `keyof O` but does a better job of ensuring returned type doesn't include `number`
 * - Only works for plain objects (i.e. objects that extend `UnknownObject`), not arrays and functions.
 */
export type Keys<T extends ReadonlyObject, F = unknown> = keyof T & string & { [K in keyof T]: T[K] extends F ? K : never }[keyof T];

/**
 * Empty object: an object with no properties.
 * - Use this as a type when you want to represent an empty object.
 * - Never use `{}` to represent empty objects because all objects and arrays and functions can extend it.
 */
export type EmptyObject = { [key in never]: never };

/**
 * Partial object: an object with specific optional properties.
 * - Cleaner than using `Record<string, T | undefined>`
 * - Consistency with `Partial<T>` and `ReadonlyObject<T>`
 */
export type PartialObject<T> = { [key: string]: T | undefined };

/**
 * Partial object: an object with specific optional properties.
 * - Cleaner than using `Record<string, T | undefined>`
 * - Consistency with `ReadonlyArray<T>`
 * - Very useful as a generic type to allow more-specific extension.
 * - Never use `{}` to represent empty objects because all objects and arrays and functions can extend it.
 */
export type ReadonlyObject<T = unknown> = { readonly [key: string]: T };

/**
 * Partial object: an object with specific optional properties.
 * - Cleaner than using `Record<string, T | undefined>`
 * - Consistency with `ReadonlyObject<T>` and `MutableArray<T>`
 */
export type MutableObject<T = unknown> = { [key: string]: T };

/**
 * Resolvable object: an object whose properties can be resolved with `resolveObject()`
 * - Property values can be `SKIP` symbol (and they will be removed).
 * - Property values can be `Promise` instances (and they will be awaited).
 */
export type ResolvableObject<T> = { [key: string]: typeof SKIP | T | Promise<typeof SKIP | T> };

/**
 * Object type: extract the type for the props of an object.
 * - Consistency with builtin `ReturnType<T>`
 */
export type ObjectType<T extends ReadonlyObject> = T extends { readonly [key: string]: infer X } ? X : never;

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
export type DeepPartial<T extends ReadonlyObject> = { [K in keyof T]?: T[K] extends ReadonlyObject ? DeepPartial<T[K]> : T[K] };

/**
 * Deep mutable object: deeply convert an object to its mutable version.
 * - Any value that extends `UnknownObject` has its props made mutable.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `UnknownObject`), not arrays and functions.
 */
export type DeepMutable<T extends ReadonlyObject> = { -readonly [K in keyof T]: T[K] extends ReadonlyObject ? DeepMutable<T[K]> : T[K] };

/**
 * Deep readonly object: deeply convert an object to its readonly version.
 * - Any value that extends `UnknownObject` has its props made readonly.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `UnknownObject`), not arrays and functions.
 */
export type DeepReadonly<T extends ReadonlyObject> = { +readonly [K in keyof T]: T[K] extends ReadonlyObject ? DeepReadonly<T[K]> : T[K] };

/**
 * Is a value an unknown object?
 * - This is a TypeScript assertion object that asserts the value extends `UnknownObject`
 * - Note: Arrays and other complex objects will return true.
 */
export const isObject = <T extends ReadonlyObject>(value: T | unknown): value is T => typeof value === "object" && value !== null;

/**
 * Turn an array of entries into an object.
 * - Eventually when browser support is good enough this can be changed to ES2019's `Object.fromEntries()`
 */
export const objectFromEntries = <V>(entries: ReadonlyEntries<V>): MutableObject<V> => {
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
export const getFirstProp = <T>(obj: ReadonlyObject<T>): Entry<T> | undefined => Object.entries(obj).shift();

/** Get the last entry from an object or array. */
export const getLastProp = <T>(obj: ReadonlyObject<T>): Entry<T> | undefined => Object.entries(obj).pop();

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
export function mapObjectKeys<V extends unknown>(
	input: ReadonlyObject<V> | ReadonlyEntries<V>, //
	mapper: (key: string, value: V) => typeof SKIP | string,
): ReadonlyObject<V> {
	let changed = false;
	const output: MutableObject<V> = {};
	const entries = input instanceof Array ? input : Object.entries(input);
	for (const [current, value] of entries) {
		const next = mapper(current, value);
		if (next !== SKIP) output[next] = value;
		if (next !== current) changed = true;
	}
	return changed ? output : (input as ReadonlyObject<V>);
}

/**
 * Map the (own) property values of an object (i.e. to change the prop values).
 *
 * @param input An input object whose property values you want to modify.
 *
 * @param mapper Mapping function that receives the key and returns the new value.
 * - Mapper can return a `Promise`. If it does will return a Promise that resolves once every value has resolved.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Mapper can be a static value and all the values will be set to that value.
 *
 * @returns The mapped object.
 * - Immutable so if the values don't change then the same instance will be returned.
 * - Prototype of the object will be the same as the input object.
 */
// Exact type mapping (used when the same prop passes straight through the mapper).
export function mapObject<T extends ReadonlyObject>(
	input: T, //
	mapper: <P extends ObjectType<T>>(value: P, key: string) => P,
): T;
// Exact type promised mapping (used when the same prop passes straight through the mapper asynronously).
export function mapObject<T extends ReadonlyObject>(
	input: T, //
	mapper: <P extends ObjectType<T>>(value: P, key: string) => P | Promise<P>,
): Promise<T>;
// Use the object like a promised dictionary.
export function mapObject<I, O>(
	input: ReadonlyEntries<I> | ReadonlyObject<I>, //
	mapper: (value: I, key: string) => Promise<typeof SKIP | O>,
): Promise<ReadonlyObject<O>>;
// Use the object like a dictionary.
export function mapObject<I, O>(
	input: ReadonlyEntries<I> | ReadonlyObject<I>, //
	mapper: ((value: I, key: string) => typeof SKIP | O) | O,
): ReadonlyObject<O>;
//
export function mapObject<I extends unknown, O extends unknown>(
	input: ReadonlyObject<I> | ReadonlyEntries<I>,
	mapper: ((value: I, key: string) => typeof SKIP | O | Promise<typeof SKIP | O>) | O,
): ReadonlyObject<O> | Promise<ReadonlyObject<O>> {
	let promises = false;
	let changed = false;
	const output: ResolvableObject<O> = input instanceof Array ? {} : { __proto__: Object.getPrototypeOf(input) };
	const entries = input instanceof Array ? input : Object.entries(input);
	for (const [key, current] of entries) {
		const next = mapper instanceof Function ? mapper(current, key) : mapper;
		if (next instanceof Promise) promises = true;
		if (next !== SKIP) output[key] = next;
		if (next !== current) changed = true;
	}
	return promises ? resolveObject(output) : changed ? (output as ReadonlyObject<O>) : (input as ReadonlyObject<O>);
}

/**
 * Map an array of object keys into an object using a mapper function or a single value.
 *
 * @param keys An array of keys to map into an object.
 *
 * @param mapper Mapping function that receives the key and returns the corresponding value.
 * - Mapper can return a `Promise`. If it does will return a Promise that resolves once every value has resolved.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Mapper can be a static value and all the values will be set to that value.
 *
 * @returns The mapped object.
 * - Immutable so if the values don't change then the same instance will be returned.
 */
export function objectFromKeys<O>(
	keys: ReadonlyArray<string>, //
	mapper: (key: string) => Promise<typeof SKIP | O>,
): Promise<ReadonlyObject<O>>;
export function objectFromKeys<O>(
	keys: ReadonlyArray<string>, //
	mapper: ((key: string) => typeof SKIP | O) | O,
): ReadonlyObject<O>;
export function objectFromKeys<O>(
	keys: ReadonlyArray<string>, //
	mapper: ((key: string) => typeof SKIP | O) | O,
): ReadonlyObject<O> | Promise<ReadonlyObject<O>> {
	let promises = false;
	const output: ResolvableObject<O> = {};
	for (const key of keys) {
		const next = mapper instanceof Function ? mapper(key) : mapper;
		if (next instanceof Promise) promises = true;
		if (next !== SKIP) output[key] = next;
	}
	return promises ? resolveObject(output) : (output as ReadonlyObject<O>);
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
export const resolveObject = async <V>(input: ResolvableObject<V> | ResolvableEntries<V>): Promise<MutableObject<V>> => {
	const output: MutableObject<V> = {};
	const entries = input instanceof Array ? input : Object.entries(input);
	await Promise.all(
		entries.map(async ([k, a]) => {
			const v = await a;
			if (v !== SKIP) output[k] = v;
		}),
	);
	return output;
};

/**
 * Add a property to an object.
 * - Different from `updateProp()` because it will create the property if it doesn't exist.
 *
 * @return New object with the specified prop.
 * - If `key` already exists in `obj` and is exactly the same (using `===`) then the exact same input object will be returned.
 */
export const withProp = <O extends ReadonlyObject, K extends string | keyof O, V>(obj: O, key: K, value: V): O & { [X in K]: V } => {
	if (key in obj && obj[key] === value) return obj as O & { [X in K]: V };
	return { ...obj, [key]: value };
};

/**
 * Remove a property from an object.
 *
 * @return New object without the specified prop.
 * - If `key` doesn't already exist in `obj` then the exact same input object will be returned.
 */
export const withoutProp = <O extends ReadonlyObject, K extends keyof O>(obj: O, key: K): Pick<O, Exclude<keyof O, K>> => {
	if (!(key in obj)) return obj as Pick<O, Exclude<keyof O, K>>;
	const { [key]: gone, ...returned } = obj; // eslint-disable-line @typescript-eslint/no-unused-vars
	return returned;
};

/**
 * Return a new object where a named property has been updated.
 * - Different from `withProp()` because it won't create the property if it doesn't exist.
 *
 * @return New object with the specified prop value.
 * - If value is exactly the same (using `===`) then the exact same input object will be returned.
 */
export const updateProp = <O extends ReadonlyObject, K extends keyof O>(obj: O, key: K, value: O[K]): O => {
	if (!(key in obj)) throw new AssertionError(`updateProp(): Property "${key}" does not exist in object`);
	if (obj[key] === value) return obj;
	return { ...obj, [key]: value };
};

/** Extract a named (possibly deep) prop from an object. */
export function getProp<O extends ReadonlyObject, K extends keyof O | string | number>(obj: O, key: K): K extends keyof O ? O[K] : undefined;
export function getProp<O extends ReadonlyObject>(obj: O, key: string | number, ...deeperKeys: (string | number)[]): unknown;
export function getProp<O extends ReadonlyObject>(obj: O, key: string | number, ...deeperKeys: (string | number)[]): unknown {
	if (!(key in obj)) return undefined;
	let current: unknown = obj[key];
	if (deeperKeys.length)
		for (const k of deeperKeys) {
			if (!isObject(current) || !(k in current)) return undefined;
			current = current[k];
		}
	return current;
}
