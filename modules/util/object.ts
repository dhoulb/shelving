import type { Entry, ImmutableEntries, ResolvableEntries } from "./entry";
import type { Resolvable } from "./data";
import type { ImmutableArray } from "./array";
import { isArray, isIterable } from "./array";
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
 * Extract a named prop from an object.
 * - Extraction is possibly deep if deeper keys are specified.
 *
 * @param obj The target object to get from.
 * @param key The key of the prop in the object to get.
 * @param deeperKeys An array of deeper keys to recurse into the object.
 */
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
 * Extract a key/value entry from a map-like object.
 *
 * @param obj The target object to get from.
 * @param key The key of the entry in the object to get.
 */
export function getEntry<T>(obj: ImmutableObject<T>, key: string): T | undefined {
	return obj[key];
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
export function withProp<O extends ImmutableObject>(input: O, key: string & keyof O, value: O[string & keyof O]): O;
export function withProp<O extends ImmutableObject, K extends string, V>(input: O, key: string, value: V): O & { [KK in K]: V };
export function withProp<O extends ImmutableObject, K extends string, V>(input: O, key: string, value: V): O & { [KK in K]: V } {
	if (key in input && input[key] === value) return input as O & { [KK in K]: V };
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
export function withProps<O extends ImmutableObject>(input: O, props: Partial<O>): O;
export function withProps<O extends ImmutableObject, P extends ImmutableObject>(input: O, props: P): O & P;
export function withProps<O extends ImmutableObject>(input: O, props: Iterable<Entry<O[keyof O]>> | Partial<O>): O {
	let changed = false;
	const output = { ...input };
	const entries = isIterable(props) ? props : Object.entries(props);
	for (const [key, value] of entries as [keyof O, O[keyof O]][])
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
export const withEntries: <T>(input: ImmutableObject<T>, entries: Iterable<Entry<T>> | ImmutableObject<T>) => ImmutableObject<T> = withProps;

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
export function setProp<O extends MutableObject, K extends keyof O>(obj: O, key: K, value: O[K]): void {
	obj[key] = value;
}

/**
 * Set several named props on an object with a known shape (by reference).
 *
 * @param obj The target object to modify.
 * @param props An object containing new props to set on the object.
 */
export function setProps<O extends MutableObject>(obj: O, props: Partial<O>): void {
	for (const [k, v] of Object.entries(props) as [keyof O, O[keyof O]][]) obj[k] = v;
}

/**
 * Add a key/value entry to a map-like object (by reference).
 *
 * @param obj The target object to modify.
 * @param key The key of the entry to add.
 * @param value The value of the entry. If the object's property isn't exactly this value, it won't be removed.
 */
export function addEntry<T>(obj: MutableObject<T>, key: string | number, value: T): void {
	obj[key] = value;
}

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
 * Count the entries of a map-like object.
 * - Only counts the object's own enumerable properties.
 * @param obj The target object to count the props of.
 */
export const countEntries = (obj: ImmutableObject | ImmutableArray): number => (isArray(obj) ? obj.length : Object.keys(obj).length);

/** Object that's able to iterate over its props as entries. */
export class EntryIterator<T extends ImmutableObject> implements Iterable<Entry<T>> {
	/** Make a new object that's able to iterate over its own enumerable own property entries. */
	static create<X extends ImmutableObject>(obj: X): X & EntryIterator<X> {
		return Object.assign(Object.create(EntryIterator.prototype), obj);
	}
	*[Symbol.iterator](): Generator<Entry<T>, void, undefined> {
		yield* Object.entries(this);
	}
}

/** Object that's able to iterate over its props. */
export class PropIterator<T extends ImmutableObject> implements Iterable<ObjectType<T>> {
	/** Make a new object that's able to iterate over its own enumerable own property values. */
	static create<X extends ImmutableObject>(obj: X): X & PropIterator<X> {
		return Object.assign(Object.create(PropIterator.prototype), obj);
	}
	*[Symbol.iterator](): Generator<ObjectType<T>, void, undefined> {
		yield* Object.values(this);
	}
}
