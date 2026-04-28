import type { DictionaryItem, ImmutableDictionary, PossibleDictionary } from "../util/dictionary.js";
import { EMPTY_DICTIONARY, getDictionaryItems, omitDictionaryItems, requireDictionary } from "../util/dictionary.js";
import { omitProps, withProp } from "../util/object.js";
import type { Updates } from "../util/update.js";
import { updateData } from "../util/update.js";
import { Store } from "./Store.js";

/** Store a dictionary object. */
export class DictionaryStore<T> extends Store<PossibleDictionary<T>, ImmutableDictionary<T>> implements Iterable<DictionaryItem<T>> {
	// Override to set default value to empty dictionary.
	constructor(value: PossibleDictionary<T> = EMPTY_DICTIONARY) {
		super(requireDictionary(value));
	}

	// Override to convert a possible dictionary to a dictionary on set.
	override convert(possible: PossibleDictionary<T>): ImmutableDictionary<T> {
		return requireDictionary(possible);
	}

	/** Get the length of the current value of this store. */
	get count(): number {
		return Object.keys(this.value).length;
	}

	/** Set a named entry in this object with a different value. */
	update(updates: Updates<ImmutableDictionary<T>>): void {
		this.value = updateData(this.value, updates);
	}

	/** Remove a named entry from this object. */
	deleteItems(...keys: string[]): void {
		this.value = omitDictionaryItems(this.value, ...keys);
	}

	/** Get an item in this dictionary. */
	get(name: string): T | undefined {
		return this.value[name];
	}

	/** Set an item in this dictionary. */
	set(name: string, value: T): void {
		this.value = withProp(this.value, name, value);
	}

	/** Delete an item (or several items) in this dictionary. */
	delete(name: string, ...names: string[]): void {
		this.value = omitProps(this.value, name, ...names);
	}

	/** Iterate over the entries of the object. */
	[Symbol.iterator](): Iterator<DictionaryItem<T>> {
		return getDictionaryItems(this.value)[Symbol.iterator]();
	}
}
