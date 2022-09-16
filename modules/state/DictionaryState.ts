import { DictionaryItem, ImmutableDictionary, omitDictionaryItems } from "../util/dictionary.js";
import { Transformers, transformDictionary } from "../util/transform.js";
import { State } from "./State.js";

/** State that stores a dictionary object and has additional methods to help with that. */
export class DictionaryState<T> extends State<ImmutableDictionary<T>> implements Iterable<DictionaryItem<T>> {
	constructor(initial: ImmutableDictionary<T> = {}) {
		super(initial);
	}

	/** Get the length of the current value of this state. */
	get count(): number {
		return Object.keys(this.value).length;
	}

	/** Set a named entry in this object with a different value. */
	update(updates: Transformers<ImmutableDictionary<T>>): void {
		this.set(transformDictionary(this.value, updates));
	}

	/** Remove a named entry from this object. */
	delete(...keys: string[]): void {
		this.set(omitDictionaryItems(this.value, ...keys));
	}

	/** Iterate over the entries of the object. */
	[Symbol.iterator](): Iterator<DictionaryItem<T>> {
		return Object.entries<T>(this.value)[Symbol.iterator]();
	}
}
