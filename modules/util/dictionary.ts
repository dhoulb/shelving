import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import type { AnyCaller } from "./function.js";
import { isIterable } from "./iterate.js";
import { deleteProps, isPlainObject, omitProps, pickProps, setProp, setProps, withProp, withProps } from "./object.js";

/**
 * Readonly dictionary object.
 * - A dictionary is a plain object whose keys are arbitrary strings, all sharing the same value type.
 *
 * @see https://shelving.cc/util/dictionary/ImmutableDictionary
 */
export type ImmutableDictionary<T = unknown> = { readonly [K in string]: T };

/**
 * Writable dictionary object.
 * - A dictionary is a plain object whose keys are arbitrary strings, all sharing the same value type.
 *
 * @see https://shelving.cc/util/dictionary/MutableDictionary
 */
export type MutableDictionary<T = unknown> = { [K in string]: T };

/**
 * Single item for a dictionary object in entry format.
 * - A readonly key/value entry tuple.
 *
 * @see https://shelving.cc/util/dictionary/DictionaryItem
 */
export type DictionaryItem<T> = readonly [string, T];

/**
 * Get the type of the _values_ of the items of a dictionary object.
 *
 * @see https://shelving.cc/util/dictionary/DictionaryValue
 */
export type DictionaryValue<T extends ImmutableDictionary> = T[string];

/**
 * Value that can be converted to a dictionary object.
 * - Either the dictionary itself, or an iterable set of key/value entry tuples.
 *
 * @see https://shelving.cc/util/dictionary/PossibleDictionary
 */
export type PossibleDictionary<T> = ImmutableDictionary<T> | Iterable<DictionaryItem<T>>;

/**
 * Is an unknown value a dictionary object?
 *
 * @param value The value to test.
 * @returns `true` if `value` is a dictionary (plain) object, narrowing its type.
 * @see https://shelving.cc/util/dictionary/isDictionary
 */
export function isDictionary(value: unknown): value is ImmutableDictionary {
	return isPlainObject(value);
}

/**
 * Assert that an unknown value is a dictionary object.
 *
 * @param value The value to assert.
 * @param caller Function to attribute a thrown error to (defaults to `assertDictionary` itself).
 * @throws {ValueError} If `value` is not a dictionary object.
 * @see https://shelving.cc/util/dictionary/assertDictionary
 */
export function assertDictionary(value: unknown, caller: AnyCaller = assertDictionary): asserts value is ImmutableDictionary {
	if (!isDictionary(value)) throw new ValueError("Must be dictionary object", { received: value, caller });
}

/**
 * Convert a possible dictionary into a dictionary.
 * - If the value is iterable it is converted to a dictionary using `Object.fromEntries()`, otherwise it is returned as-is.
 *
 * @param dict The dictionary or iterable set of key/value entry tuples to convert.
 * @returns The corresponding dictionary object.
 * @see https://shelving.cc/util/dictionary/requireDictionary
 */
export function requireDictionary<T>(dict: PossibleDictionary<T>): ImmutableDictionary<T> {
	return isDictionary(dict) ? dict : Object.fromEntries(dict as Iterable<DictionaryItem<T>>);
}

/**
 * Turn a dictionary object into a set of props.
 *
 * @param input The dictionary or iterable set of key/value entry tuples to read.
 * @returns Iterable set of key/value entry tuples for the dictionary.
 * @see https://shelving.cc/util/dictionary/getDictionaryItems
 */
export function getDictionaryItems<T>(input: ImmutableDictionary<T>): readonly DictionaryItem<T>[];
export function getDictionaryItems<T>(input: PossibleDictionary<T>): Iterable<DictionaryItem<T>>;
export function getDictionaryItems<T>(input: PossibleDictionary<T>): Iterable<DictionaryItem<T>> {
	return isIterable(input) ? input : Object.entries(input);
}

/**
 * Is an unknown value the key for an own prop of a dictionary.
 *
 * @param dict The dictionary to test against.
 * @param key The key to test for.
 * @returns `true` if `key` is a string and an own prop of `dict`, narrowing its type.
 * @see https://shelving.cc/util/dictionary/isDictionaryItem
 */
export function isDictionaryItem<T>(dict: ImmutableDictionary<T>, key: unknown): key is string {
	return typeof key === "string" && Object.hasOwn(dict, key);
}

/**
 * Assert that an unknown value is the key for an own prop of a dictionary.
 *
 * @param dict The dictionary to assert against.
 * @param key The key to assert is an own prop.
 * @param caller Function to attribute a thrown error to (defaults to `assertDictionaryItem` itself).
 * @throws {RequiredError} If `key` is not an own prop of `dict`.
 * @see https://shelving.cc/util/dictionary/assertDictionaryItem
 */
export function assertDictionaryItem<T>(
	dict: ImmutableDictionary<T>,
	key: string,
	caller: AnyCaller = assertDictionaryItem,
): asserts key is string {
	if (!isDictionaryItem(dict, key)) throw new RequiredError("Key must exist in dictionary object", { key, dict, caller });
}

/**
 * Get an item in a dictionary object, or throw `RequiredError` if it doesn't exist.
 *
 * @param dict The dictionary to read the item from.
 * @param key The key of the item to read.
 * @param caller Function to attribute a thrown error to (defaults to `requireDictionaryItem` itself).
 * @returns The value of the item.
 * @throws {RequiredError} If `key` is not an own prop of `dict`.
 * @see https://shelving.cc/util/dictionary/requireDictionaryItem
 */
export function requireDictionaryItem<T>(dict: ImmutableDictionary<T>, key: string, caller: AnyCaller = requireDictionaryItem): T {
	assertDictionaryItem(dict, key, caller);
	return dict[key] as T;
}

/**
 * Get an item in a dictionary object, or `undefined` if it doesn't exist.
 *
 * @param dict The dictionary to read the item from.
 * @param key The key of the item to read.
 * @returns The value of the item, or `undefined` if `key` is not an own prop of `dict`.
 * @see https://shelving.cc/util/dictionary/getDictionaryItem
 */
export function getDictionaryItem<T>(dict: ImmutableDictionary<T>, key: string): T | undefined {
	return dict[key];
}

/**
 * Set an item on a dictionary object (immutably) and return a new object including that item.
 * - If the value is unchanged the original dictionary is returned unchanged.
 *
 * @param dict The dictionary to set the item on.
 * @param key The key of the item to set.
 * @param value The value of the item to set.
 * @returns A new dictionary including the set item, or the original dictionary if the value was unchanged.
 * @see https://shelving.cc/util/dictionary/withDictionaryItem
 */
export const withDictionaryItem: <T>(dict: ImmutableDictionary<T>, key: string, value: T) => ImmutableDictionary<T> = withProp;

/**
 * Set several items on a dictionary object (immutably) and return a new object including those items.
 * - If all values are unchanged the original dictionary is returned unchanged.
 *
 * @param dict The dictionary to set the items on.
 * @param props The items to set, as a dictionary or iterable set of key/value entry tuples.
 * @returns A new dictionary including the set items, or the original dictionary if all values were unchanged.
 * @see https://shelving.cc/util/dictionary/withDictionaryItems
 */
export const withDictionaryItems: <T>(dict: ImmutableDictionary<T>, props: PossibleDictionary<T>) => ImmutableDictionary<T> = withProps;

/**
 * Remove several items from a dictionary object (immutably) and return a new object without those items.
 * - If none of the keys exist the original dictionary is returned unchanged.
 *
 * @param dict The dictionary to remove the items from.
 * @param keys The keys of the items to remove.
 * @returns A new dictionary without the removed items, or the original dictionary if no keys were present.
 * @see https://shelving.cc/util/dictionary/omitDictionaryItems
 */
export const omitDictionaryItems: <T>(dict: ImmutableDictionary<T>, ...keys: string[]) => ImmutableDictionary<T> = omitProps;

/**
 * Remove an item from a dictionary object (immutably) and return a new object without that item.
 * - If the key doesn't exist the original dictionary is returned unchanged.
 *
 * @param dict The dictionary to remove the item from.
 * @param key The key of the item to remove.
 * @returns A new dictionary without the removed item, or the original dictionary if the key was not present.
 * @see https://shelving.cc/util/dictionary/omitDictionaryItem
 */
export const omitDictionaryItem: <T>(dict: ImmutableDictionary<T>, key: string) => ImmutableDictionary<T> = omitProps;

/**
 * Pick several items from a dictionary object and return a new object with only those items.
 *
 * @param dict The dictionary to pick the items from.
 * @param keys The keys of the items to pick.
 * @returns A new dictionary containing only the picked items.
 * @see https://shelving.cc/util/dictionary/pickDictionaryItems
 */
export const pickDictionaryItems: <T>(dict: ImmutableDictionary<T>, ...keys: string[]) => ImmutableDictionary<T> = pickProps;

/**
 * Set a single named item on a dictionary object (by reference) and return its value.
 * - The key is trusted by contract: a runtime-untrusted key like `"__proto__"` would mutate the target's prototype, so validate or filter untrusted keys before calling (or use a null-prototype target).
 *
 * @param dict The dictionary to set the item on (modified by reference).
 * @param key The key of the item to set.
 * @param value The value of the item to set.
 * @returns The value that was set.
 * @see https://shelving.cc/util/dictionary/setDictionaryItem
 */
export const setDictionaryItem: <T>(dict: MutableDictionary<T>, key: string, value: T) => T = setProp;

/**
 * Set several named items on a dictionary object (by reference).
 * - Keys are trusted by contract: a runtime-untrusted key like `"__proto__"` would mutate the target's prototype, so validate or filter untrusted keys before calling (or use a null-prototype target).
 *
 * @param dict The dictionary to set the items on (modified by reference).
 * @param entries The items to set, as a dictionary or iterable set of key/value entry tuples.
 * @see https://shelving.cc/util/dictionary/setDictionaryItems
 */
export const setDictionaryItems: <T>(dict: MutableDictionary<T>, entries: PossibleDictionary<T>) => void = setProps;

/**
 * Remove several key/value entries from a dictionary object (by reference).
 *
 * @param dict The dictionary to remove the items from (modified by reference).
 * @param keys The keys of the items to remove.
 * @see https://shelving.cc/util/dictionary/deleteDictionaryItems
 */
export const deleteDictionaryItems: <T extends MutableDictionary>(dict: T, ...keys: string[]) => void = deleteProps;

/**
 * Remove a key/value entry from a dictionary object (by reference).
 *
 * @param dict The dictionary to remove the item from (modified by reference).
 * @param key The key of the item to remove.
 * @see https://shelving.cc/util/dictionary/deleteDictionaryItem
 */
export const deleteDictionaryItem: <T extends MutableDictionary>(dict: T, key: string) => void = deleteProps;

/**
 * Type that represents an empty dictionary object.
 *
 * @see https://shelving.cc/util/dictionary/EmptyDictionary
 */
export type EmptyDictionary = { readonly [K in never]: never };

/**
 * An empty dictionary object.
 *
 * @see https://shelving.cc/util/dictionary/EMPTY_DICTIONARY
 */
export const EMPTY_DICTIONARY: EmptyDictionary = { __proto__: null };
