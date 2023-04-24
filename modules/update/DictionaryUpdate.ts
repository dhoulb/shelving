import { isNullish, Nullish } from "../util/null.js";
import { DictionaryItem, getDictionaryItems, ImmutableDictionary, isDictionaryKey, MutableDictionary } from "../util/dictionary.js";
import { transform } from "../util/transform.js";
import { getPrototype } from "../util/object.js";
import { Update } from "./Update.js";
import { Delete, DELETE } from "./Delete.js";

/** Update that can be applied to a dictionary object to add/remove/update its entries. */
export class DictionaryUpdate<T> extends Update<ImmutableDictionary<T>> implements Iterable<DictionaryItem<T | Update<T> | Delete>> {
	/** Return a dictionary update with a specific entry marked for update. */
	static update<X>(key: Nullish<string>, value: X | Update<X> | Delete): DictionaryUpdate<X> {
		return new DictionaryUpdate<X>(isNullish(key) ? {} : { [key]: value });
	}

	/** Return a dictionary update with a specific entry marked for deletion. */
	static delete<X>(key: Nullish<string>): DictionaryUpdate<X> {
		return new DictionaryUpdate<X>(isNullish(key) ? {} : { [key]: DELETE });
	}

	readonly updates: ImmutableDictionary<T | Update<T> | Delete>;
	constructor(updates: ImmutableDictionary<T | Update<T> | Delete> = {}) {
		super();
		this.updates = updates;
	}

	/** Return a dictionary update with a specific entry marked for update. */
	update(key: Nullish<string>, value: T | Update<T>): this {
		if (isNullish(key)) return this;
		return {
			__proto__: getPrototype(this),
			...this,
			updates: { ...this.updates, [key]: value },
		};
	}

	/** Return a dictionary update with a specific entry marked for deletion. */
	delete(key: Nullish<string>): this {
		if (isNullish(key)) return this;
		return {
			__proto__: getPrototype(this),
			...this,
			updates: { ...this.updates, [key]: DELETE },
		};
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
		for (const entry of getDictionaryItems(this.updates)) yield entry;
	}
}
