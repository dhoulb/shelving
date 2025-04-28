import { AssertionError } from "../error/AssertionError.js";
import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import { isIterable } from "./iterate.js";
import { deleteProps, isPlainObject, omitProps, pickProps, setProp, setProps, withProp, withProps } from "./object.js";

/** Readonly dictionary object. */
export type ImmutableDictionary<T = unknown> = { readonly [K in string]: T };

/** Writable dictionary object. */
export type MutableDictionary<T = unknown> = { [K in string]: T };

/** Get the type for an item of a dictionary object in entry format. */
export type DictionaryItem<T> = readonly [string, T];

/** Get the type of the _values_ of the items of a dictionary object. */
export type DictionaryValue<T extends ImmutableDictionary> = T[string];

/** Something that can be converted to a dictionary object. */
export type PossibleDictionary<T> = ImmutableDictionary<T> | Iterable<DictionaryItem<T>>;

/** Is an unknown value a dictionary object? */
export function isDictionary(value: unknown): value is ImmutableDictionary {
	return isPlainObject(value);
}

/** Assert that an unknown value is a dictionary object */
export function assertDictionary(value: unknown): asserts value is ImmutableDictionary {
	if (!isDictionary(value)) throw new ValueError("Must be dictionary object", { received: value, caller: assertDictionary });
}

/** turn a possible dictionary into a dictionary. */
export function getDictionary<T>(dict: PossibleDictionary<T>): ImmutableDictionary<T> {
	return isIterable(dict) ? Object.fromEntries(dict) : dict;
}

/** Turn a dictionary object into a set of props. */
export function getDictionaryItems<T>(dict: ImmutableDictionary<T>): readonly DictionaryItem<T>[];
export function getDictionaryItems<T>(dict: PossibleDictionary<T>): Iterable<DictionaryItem<T>>;
export function getDictionaryItems<T>(dict: PossibleDictionary<T>): Iterable<DictionaryItem<T>> {
	return isIterable(dict) ? dict : Object.entries<T>(dict);
}

/** Is an unknown value the key for an own prop of a dictionary. */
export function isDictionaryItem<T>(dict: ImmutableDictionary<T>, key: unknown): key is string {
	return typeof key === "string" && Object.hasOwn(dict, key);
}

/** Assert that an unknown value is the key for an own prop of a dictionary. */
export function assertDictionaryItem<T>(dict: ImmutableDictionary<T>, key: unknown): asserts key is string {
	if (!isDictionaryItem(dict, key))
		throw new AssertionError("Key must exist in dictionary object", { key, dict, caller: assertDictionaryItem });
}

/** Get an item in a map or throw `RequiredError` if it doesn't exist. */
export function requireDictionaryItem<T>(dict: ImmutableDictionary<T>, key: string): T {
	if (!Object.hasOwn(dict, key))
		throw new RequiredError("Key must exist in dictionary object", { key, dict, caller: requireDictionaryItem });
	return dict[key] as T;
}

/** Get an item in a map or `undefined` if it doesn't exist. */
export function getDictionaryItem<T>(dict: ImmutableDictionary<T>, key: string): T | undefined {
	return dict[key];
}

/** Set a prop on a dictionary object (immutably) and return a new object including that prop. */
export const withDictionaryItem: <T>(dict: ImmutableDictionary<T>, key: string, value: T) => ImmutableDictionary<T> = withProp;

/** Set several props on a dictionary object (immutably) and return a new object including those props. */
export const withDictionaryItems: <T>(dict: ImmutableDictionary<T>, props: PossibleDictionary<T>) => ImmutableDictionary<T> = withProps;

/** Remove several key/value entries from a dictionary object (immutably) and return a new object without those props. */
export const omitDictionaryItems: <T>(dict: ImmutableDictionary<T>, ...keys: string[]) => ImmutableDictionary<T> = omitProps;

/** Pick several props from a dictionary object and return a new object with only thos props. */
export const pickDictionaryItems: <T>(dict: ImmutableDictionary<T>, ...keys: string[]) => ImmutableDictionary<T> = pickProps;

/** Set a single named prop on a dictionary object (by reference) and return its value. */
export const setDictionaryItem: <T>(dict: MutableDictionary<T>, key: string, value: T) => T = setProp;

/** Set several named props on a dictionary object (by reference). */
export const setDictionaryItems: <T>(dict: MutableDictionary<T>, entries: PossibleDictionary<T>) => void = setProps;

/** Remove several key/value entries from a dictionary object (by reference). */
export const deleteDictionaryItems: <T extends MutableDictionary>(dict: T, ...keys: string[]) => void = deleteProps;
