import type { StateOptions } from "./State.js";
import type { DictionaryItem, ImmutableDictionary } from "../util/dictionary.js";
import type { Updates } from "../util/update.js";
import { getDictionaryItems, omitDictionaryItems } from "../util/dictionary.js";
import { withProp } from "../util/object.js";
import { updateData } from "../util/update.js";
import { State } from "./State.js";

/** State that stores a dictionary object and has additional methods to help with that. */
export class DictionaryState<T> extends State<ImmutableDictionary<T>> implements Iterable<DictionaryItem<T>> {
	constructor(options: StateOptions<ImmutableDictionary<T>> = {}) {
		super("value" in options ? options : { ...options, value: {} });
	}

	/** Get the length of the current value of this state. */
	get count(): number {
		return Object.keys(this.value).length;
	}

	/** Set a named entry in this object with a different value. */
	update(updates: Updates<ImmutableDictionary<T>>): void {
		this.value = updateData(this.value, updates);
	}

	/** Remove a named entry from this object. */
	delete(...keys: string[]): void {
		this.value = omitDictionaryItems(this.value, ...keys);
	}

	/** Get an item in this dictionary. */
	getItem(name: string): T | undefined {
		return this.value[name];
	}

	/** Set an item in this dictionary. */
	setItem(name: string, value: T): void {
		this.value = withProp(this.value, name, value);
	}

	/** Iterate over the entries of the object. */
	[Symbol.iterator](): Iterator<DictionaryItem<T>> {
		return getDictionaryItems(this.value)[Symbol.iterator]();
	}
}
