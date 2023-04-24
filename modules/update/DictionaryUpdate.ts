import { isNullish, Nullish } from "../util/null.js";
import { DictionaryItem, getDictionaryItems, ImmutableDictionary, isDictionaryKey, MutableDictionary } from "../util/dictionary.js";
import { transform } from "../util/transform.js";
import { getPrototype } from "../util/object.js";
import { Update } from "./Update.js";
import { Delete, DELETE } from "./Delete.js";

/** Update that can be applied to a dictionary object to add/remove/update its entries. */
export class DictionaryUpdate<T> extends Update<ImmutableDictionary<T>> implements Iterable<DictionaryItem<T | Update<T> | Delete>> {
	/** Return a dictionary update with multiple items set. */
	static set<X>(items: ImmutableDictionary<X>): DictionaryUpdate<X> {
		return new DictionaryUpdate<X>(items);
	}

	/** Return a dictionary update with multiple items updated. */
	static update<X>(items: ImmutableDictionary<X | Update<X> | Delete>): DictionaryUpdate<X> {
		return new DictionaryUpdate<X>(items);
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

	/** Return a dictionary update with a specific item set. */
	setItem(key: Nullish<string>, value: T): this {
		return this.updateItem(key, value);
	}

	/** Return a dictionary update with a specific item updated. */
	updateItem(key: Nullish<string>, value: T | Update<T> | Delete): this {
		if (isNullish(key)) return this;
		return {
			__proto__: getPrototype(this),
			...this,
			updates: { ...this.updates, [key]: value },
		};
	}

	/** Return a dictionary update with a specific item deleted. */
	deleteItem(key: Nullish<string>): this {
		return this.updateItem(key, DELETE);
	}

	// Implement `Transformable`
	transform(input: ImmutableDictionary<T> = {}): ImmutableDictionary<T> {
		let changed = false;
		const output: MutableDictionary<T> = { ...input };
		for (const [k, t] of getDictionaryItems(this.updates)) {
			if (isDictionaryKey(input, k)) {
				if (t instanceof Delete) {
					delete output[k];
					if (!changed) changed = true;
				} else {
					const i = input[k];
					const o = transform(i, t);
					output[k] = o;
					if (!changed && i !== o) changed = true;
				}
			}
		}
		return changed ? output : input;
	}

	// Implement `Iterable`
	*[Symbol.iterator](): Iterator<DictionaryItem<T | Update<T> | Delete>, void> {
		for (const item of getDictionaryItems(this.updates)) yield item;
	}
}
