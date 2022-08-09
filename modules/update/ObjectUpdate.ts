import type { Entry } from "../util/entry.js";
import { isNullish, Nullish } from "../util/null.js";
import { ImmutableObject } from "../util/object.js";
import { transform } from "../util/transform.js";
import { ObjectSchema } from "../schema/ObjectSchema.js";
import { validate, Validator } from "../util/validate.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { Feedback, isFeedback } from "../feedback/Feedback.js";
import { Update } from "./Update.js";
import { Delete, DELETE } from "./Delete.js";

/** Set of named transforms for the entries of a map-like object. */
export type EntryUpdates<T> = ImmutableObject<T | Update<T> | Delete>;

/** Update that can be applied to a map-like object to add/remove/update its entries. */
export class ObjectUpdate<T> extends Update<ImmutableObject<T>> implements Iterable<Entry<string, T | Update<T> | Delete>> {
	/** Return an object update with a specific entry marked for update. */
	static with<X>(key: Nullish<string>, value: X | Update<X> | Delete): ObjectUpdate<X> {
		return new ObjectUpdate<X>(isNullish(key) ? {} : { [key]: value });
	}

	/** Return an object update with a specific entry marked for deletion. */
	static without<X>(key: Nullish<string>): ObjectUpdate<X> {
		return new ObjectUpdate<X>(isNullish(key) ? {} : { [key]: DELETE });
	}

	readonly updates: EntryUpdates<T>;
	constructor(updates: EntryUpdates<T> = {}) {
		super();
		this.updates = updates;
	}

	transform(obj: ImmutableObject<T> = {}): ImmutableObject<T> {
		return Object.fromEntries(_transformEntries(obj, this.updates));
	}

	override validate(validator: Validator<ImmutableObject<T>>): this {
		if (!(validator instanceof ObjectSchema)) return super.validate(validator);
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			updates: Object.fromEntries(_validateUpdates(this.updates, validator.items)),
		};
	}

	/** Return an object update with a specific entry marked for update. */
	with(key: Nullish<string>, value: T | Update<T>): this {
		if (isNullish(key)) return this;
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			updates: { ...this.updates, [key]: value },
		};
	}

	/** Return an object update with a specific entry marked for deletion. */
	without(key: Nullish<string>): this {
		if (isNullish(key)) return this;
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			updates: { ...this.updates, [key]: DELETE },
		};
	}

	/**
	 * Iterate over the changes in this object.
	 * - Updates are yielded first, then deletes.
	 * - Entries whose value is `undefined` indicate deletion.
	 */
	*[Symbol.iterator](): Iterator<Entry<string, T | Update<T> | Delete>, void> {
		for (const entry of Object.entries(this.updates)) yield entry;
	}
}

function* _transformEntries<T>(obj: ImmutableObject<T>, updates: EntryUpdates<T>): Iterable<Entry<string, T>> {
	for (const [k, v] of Object.entries({ ...obj, ...updates })) {
		if (v instanceof Delete) continue;
		yield [k, transform(obj[k], v)];
	}
}

function* _validateUpdates<T>(updates: EntryUpdates<T>, validator: Validator<T>): Iterable<Entry<string, T | Update<T> | Delete>> {
	const feedbacks = new Map<string, Feedback>();
	for (const [key, value] of Object.entries(updates)) {
		try {
			yield [key, value instanceof Update ? value.validate(validator) : validate(value, validator)];
		} catch (thrown) {
			if (!isFeedback(thrown)) throw thrown;
			feedbacks.set(key, thrown);
		}
	}
	if (feedbacks.size) throw new InvalidFeedback("Invalid updates", feedbacks);
}
