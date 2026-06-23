import type { DictionaryItem, ImmutableDictionary, PossibleDictionary } from "../util/dictionary.js";
import { EMPTY_DICTIONARY, getDictionaryItems, omitDictionaryItems, requireDictionary } from "../util/dictionary.js";
import { omitProps, withProp } from "../util/object.js";
import type { Updates } from "../util/update.js";
import { updateData } from "../util/update.js";
import { BusyStore } from "./BusyStore.js";

/**
 * Store a dictionary object (string-keyed map of values), with helpers to read and mutate its entries.
 * - Accepts any `PossibleDictionary<T>` as input and normalises it to an `ImmutableDictionary<T>`.
 * - Mutations replace the stored dictionary with an immutable updated copy.
 * - Iterable, yielding `[key, value]` entry tuples.
 *
 * @param value The initial dictionary value (defaults to an empty dictionary).
 * @example
 * const store = new DictionaryStore<number>({ a: 1, b: 2 });
 * store.set("c", 3);
 * store.get("a"); // 1
 * @see https://shelving.cc/store/DictionaryStore
 */
export class DictionaryStore<T> extends BusyStore<ImmutableDictionary<T>, PossibleDictionary<T>> implements Iterable<DictionaryItem<T>> {
	// Override to set default value to empty dictionary.
	constructor(value: PossibleDictionary<T> = EMPTY_DICTIONARY) {
		super(requireDictionary(value));
	}

	// Override to convert a possible dictionary to a dictionary on set.
	protected override _convert(possible: PossibleDictionary<T>): ImmutableDictionary<T> {
		return requireDictionary(possible);
	}

	/**
	 * Get the number of entries in the current value of this store.
	 *
	 * @see https://shelving.cc/store/DictionaryStore/count
	 */
	get count(): number {
		return Object.keys(this.value).length;
	}

	/**
	 * Update several entries in this dictionary.
	 *
	 * @param updates The set of entry updates to apply.
	 * @returns Nothing.
	 * @example store.update({ a: 10, b: 20 });
	 * @see https://shelving.cc/store/DictionaryStore/update
	 */
	update(updates: Updates<ImmutableDictionary<T>>): void {
		this.value = updateData(this.value, updates);
	}

	/**
	 * Remove one or more named entries from this dictionary.
	 *
	 * @param keys The keys of the entries to remove.
	 * @returns Nothing.
	 * @example store.deleteItems("a", "b");
	 * @see https://shelving.cc/store/DictionaryStore/deleteItems
	 */
	deleteItems(...keys: string[]): void {
		this.value = omitDictionaryItems(this.value, ...keys);
	}

	/**
	 * Get a single named item from this dictionary, or `undefined` if it is not set.
	 *
	 * @param name The key of the item to read.
	 * @returns The item value, or `undefined` if it is not present.
	 * @example store.get("a"); // 1
	 * @see https://shelving.cc/store/DictionaryStore/get
	 */
	get(name: string): T | undefined {
		return this.value[name];
	}

	/**
	 * Set a single named item in this dictionary.
	 *
	 * @param name The key of the item to set.
	 * @param value The new value for the item.
	 * @returns Nothing.
	 * @example store.set("a", 10);
	 * @see https://shelving.cc/store/DictionaryStore/set
	 */
	set(name: string, value: T): void {
		this.value = withProp(this.value, name, value);
	}

	/**
	 * Delete one or more named items from this dictionary.
	 *
	 * @param name The key of the first item to delete.
	 * @param names Additional keys to delete.
	 * @returns Nothing.
	 * @example store.delete("a", "b");
	 * @see https://shelving.cc/store/DictionaryStore/delete
	 */
	delete(name: string, ...names: string[]): void {
		this.value = omitProps(this.value, name, ...names);
	}

	/**
	 * Iterate over the `[key, value]` entries of this dictionary.
	 *
	 * @returns An iterator over the dictionary's entry tuples.
	 * @see https://shelving.cc/store/DictionaryStore/[Symbol.iterator]
	 */
	[Symbol.iterator](): Iterator<DictionaryItem<T>> {
		return getDictionaryItems(this.value)[Symbol.iterator]();
	}
}
