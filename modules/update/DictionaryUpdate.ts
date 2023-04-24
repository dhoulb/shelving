import { isNullish, Nullish } from "../util/null.js";
import { DictionaryItem, getDictionaryItems, ImmutableDictionary } from "../util/dictionary.js";
import { transformObject } from "../util/transform.js";
import { cloneObjectWith } from "../util/object.js";
import { Update } from "./Update.js";
import { Delete, DELETE } from "./Delete.js";

/** Update that can be applied to a dictionary object to add/remove/update its entries. */
export class DictionaryUpdate<T> extends Update<ImmutableDictionary<T>> implements Iterable<DictionaryItem<T | Update<T> | Delete>> {
	/** Return a dictionary update with multiple items set. */
	static set<X>(items: ImmutableDictionary<X>): DictionaryUpdate<X> {
		return new DictionaryUpdate<X>(items);
	}

	/** Return a dictionary update with multiple items updated. */
	static update<X>(updates: ImmutableDictionary<X | Update<X> | Delete>): DictionaryUpdate<X> {
		return new DictionaryUpdate<X>(updates);
	}

	/** Return a dictionary update with a specific item set. */
	static setItem<X>(key: Nullish<string>, value: X): DictionaryUpdate<X> {
		return DictionaryUpdate.updateItem<X>(key, value);
	}

	/** Return a dictionary update with a specific item updated. */
	static updateItem<X>(key: Nullish<string>, value: X | Update<X> | Delete): DictionaryUpdate<X> {
		return new DictionaryUpdate<X>(isNullish(key) ? {} : { [key]: value });
	}

	/** Return a dictionary update with a specific item marked for deletion. */
	static deleteItem<X>(key: Nullish<string>): DictionaryUpdate<X> {
		return DictionaryUpdate.updateItem<X>(key, DELETE);
	}

	readonly updates: ImmutableDictionary<T | Update<T> | Delete>;
	constructor(updates: ImmutableDictionary<T | Update<T> | Delete> = {}) {
		super();
		this.updates = updates;
	}

	/** Return a dictionary update with multiple items updated. */
	set(items: ImmutableDictionary<T>): DictionaryUpdate<T> {
		return cloneObjectWith(this, "updates", { ...this.updates, ...items });
	}

	/** Return a dictionary update with multiple items updated. */
	update(updates: ImmutableDictionary<T | Update<T> | Delete>): DictionaryUpdate<T> {
		return cloneObjectWith(this, "updates", { ...this.updates, ...updates });
	}

	/** Return a dictionary update with a specific item set. */
	setItem(key: Nullish<string>, value: T): this {
		return this.updateItem(key, value);
	}

	/** Return a dictionary update with a specific item updated. */
	updateItem(key: Nullish<string>, value: T | Update<T> | Delete): this {
		return isNullish(key) ? this : cloneObjectWith(this, "updates", { ...this.updates, [key]: value });
	}

	/** Return a dictionary update with a specific item deleted. */
	deleteItem(key: Nullish<string>): this {
		return this.updateItem(key, DELETE);
	}

	// Implement `Transformable`
	transform(input: ImmutableDictionary<T> = {}): ImmutableDictionary<T> {
		return transformObject(input, this.updates);
	}

	// Implement `Iterable`
	*[Symbol.iterator](): Iterator<DictionaryItem<T | Update<T> | Delete>, void> {
		for (const item of getDictionaryItems(this.updates)) yield item;
	}
}
