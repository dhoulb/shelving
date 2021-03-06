import type { Entry, ImmutableEntries, ResolvableEntries } from "./entry";
import type { Resolvable } from "./data";
import { SKIP } from "./constants";
import { isAsync } from "./promise";

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
export type ObjectType<T extends ImmutableObject> = T[keyof T];

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
 * Is a value an unknown object?
 * - This is a TypeScript assertion object that asserts the value extends `UnknownObject`
 * - Note: Arrays and other complex objects will return true.
 */
export const isObject = <T extends ImmutableObject>(value: T | unknown): value is T => typeof value === "object" && value !== null;

/**
 * Is a value an iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export const isIterable = <T extends Iterable<unknown>>(value: T | unknown): value is T => isObject(value) && Symbol.iterator in value;

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
	input: ImmutableObject<V> | ImmutableEntries<V>, //
	mapper: (key: string, value: V) => typeof SKIP | string,
): ImmutableObject<V>;
export function mapKeys(
	input: ImmutableObject | ImmutableEntries, //
	mapper: (key: string, value: unknown) => typeof SKIP | string,
): ImmutableObject {
	let changed = false;
	const output: MutableObject = {};
	const entries = input instanceof Array ? input : Object.entries(input);
	for (const [current, value] of entries) {
		const next = mapper(current, value);
		if (next !== SKIP) output[next] = value;
		if (next !== current) changed = true;
	}
	return changed || input instanceof Array ? output : input;
}

/**
 * Map the (own) property values of an object (i.e. to change the prop values).
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
	const output: Mutable<ResolvableObject> = {};
	const iterable = isIterable(input) ? input : Object.entries(input);
	for (const [key, current] of iterable) {
		const next = typeof mapper === "function" ? mapper(current, key) : mapper;
		if (isAsync(next)) promises = true;
		if (next !== SKIP) output[key] = next;
		if (next !== current) changed = true;
	}
	return promises ? resolveObject(output) : !changed && input !== iterable ? (input as ImmutableObject) : output;
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
	const output: Mutable<ResolvableObject> = {};
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
export const withProp = <O extends ImmutableObject, K extends string | keyof O, V>(obj: O, key: K, value: V): O & { [X in K]: V } => {
	if (key in obj && obj[key] === value) return obj as O & { [X in K]: V };
	return { ...obj, [key]: value };
};

/**
 * Remove a property from an object.
 *
 * @return New object without the specified prop.
 * - If `key` doesn't already exist in `obj` then the exact same input object will be returned.
 */
export const withoutProp = <O extends ImmutableObject, K extends keyof O>(obj: O, key: K): Pick<O, Exclude<keyof O, K>> => {
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
export const updateProp = <O extends ImmutableObject, K extends keyof O>(obj: O, key: K, value: O[K]): O => {
	if (obj[key] === value) return obj;
	return { ...obj, [key]: value };
};

/**
 * Return a new object where several named properties has been updated.
 * - Different from `withProp()` because it won't create the property if it doesn't exist.
 *
 * @return New object with the specified prop value.
 * - If value is exactly the same (using `===`) then the exact same input object will be returned.
 */
export const updateProps = <O extends ImmutableObject>(obj: O, partial: Partial<O>): O => {
	let changed = false;
	const entries: [keyof O, O[keyof O]][] = Object.entries(partial);
	for (const [k, v] of entries)
		if (obj[k] !== v) {
			changed = true;
			break;
		}
	return changed ? { ...obj, ...partial } : obj;
};

/** Extract a named (possibly deep) prop from an object. */
export function getProp<O extends ImmutableObject, K extends keyof O | string | number>(obj: O, key: K): K extends keyof O ? O[K] : undefined;
export function getProp<O extends ImmutableObject>(obj: O, key: string | number, ...deeperKeys: (string | number)[]): unknown;
export function getProp<O extends ImmutableObject>(obj: O, key: string | number, ...deeperKeys: (string | number)[]): unknown {
	if (!(key in obj)) return undefined;
	let current: unknown = obj[key];
	if (deeperKeys.length)
		for (const k of deeperKeys) {
			if (!isObject(current) || !(k in current)) return undefined;
			current = current[k];
		}
	return current;
}

/**
 * Add a key/value pair to an object.
 * @param value The value of the entry. If the object's property isn't exactly this value, it won't be removed.
 */
export function addEntry<T>(obj: MutableObject<T>, key: string | number, value: T): void {
	obj[key] = value;
}

/**
 * Delete a key/value pair from an object (by reference).
 * @param value The value of the entry. If the object's property isn't exactly this value, it won't be removed.
 */
export function removeEntry<T>(obj: MutableObject<T>, key: string | number, value: T): void {
	if (obj[key] === value) delete obj[key];
}

/** Object that's able to iterate over its own enumerable own property values. */
export class PropIterator<T extends ImmutableObject> implements Iterable<ObjectType<T>> {
	/** Make a new object that's able to iterate over its own enumerable own property values. */
	static create<X extends ImmutableObject>(obj: X): X & PropIterator<X> {
		return Object.assign(Object.create(PropIterator.prototype), obj);
	}
	*[Symbol.iterator](): Generator<ObjectType<T>, void, undefined> {
		yield* Object.values(this);
	}
}

/** Object that's able to iterate over its own enumerable own property entries. */
export class EntryIterator<T extends ImmutableObject> implements Iterable<Entry<T>> {
	/** Make a new object that's able to iterate over its own enumerable own property entries. */
	static create<X extends ImmutableObject>(obj: X): X & EntryIterator<X> {
		return Object.assign(Object.create(EntryIterator.prototype), obj);
	}
	*[Symbol.iterator](): Generator<Entry<T>, void, undefined> {
		yield* Object.entries(this);
	}
}

/** Count the own enumerable properties of an object. */
export const countProps = (obj: ImmutableObject): number => Object.keys(obj).length;
