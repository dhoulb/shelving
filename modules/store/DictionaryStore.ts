import type { DictionaryItem, ImmutableDictionary } from "../util/dictionary.js";
import { getDictionaryItems, omitDictionaryItems } from "../util/dictionary.js";
import { omitProps, withProp } from "../util/object.js";
import type { Updates } from "../util/update.js";
import { updateData } from "../util/update.js";
import { Store } from "./Store.js";

/** Store a dictionary object. */
export class DictionaryStore<T> extends Store<ImmutableDictionary<T>> implements Iterable<DictionaryItem<T>> {
	constructor(value: ImmutableDictionary<T> = {}, time?: number) {
		super(value, time);
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

	/** Delete an item in this dictionary. */
	delete(name: string, value: T): void {
		this.value = omitProps(this.value, name);
	}

	/** Iterate over the entries of the object. */
	[Symbol.iterator](): Iterator<DictionaryItem<T>> {
		return getDictionaryItems(this.value)[Symbol.iterator]();
	}
}
