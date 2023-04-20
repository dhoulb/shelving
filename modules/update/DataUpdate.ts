import { Feedback, isFeedback } from "../feedback/Feedback.js";
import { Feedbacks } from "../feedback/Feedbacks.js";
import { MutableDictionary } from "../index.js";
import { DataSchema } from "../schema/DataSchema.js";
import { Data, DataKey, DataProp, getDataProps } from "../util/data.js";
import { isNullish, Nullish } from "../util/null.js";
import { getPrototype } from "../util/object.js";
import { Transformable, transformObject } from "../util/transform.js";
import { validate, Validator, Validators } from "../util/validate.js";
import { Update } from "./Update.js";

/**
 * Set of named updates for the props of a data object.
 * - Similar to `Transformers` but only allows `Update` instances.
 * - If a prop contains a new value, the prop is set to that new value.
 * - If a prop contains an `Update` instance, the existing value is updated.
 */
export type Updates<T extends Data = Data> = { readonly [K in keyof T]?: T[K] | Update<T[K]> | undefined };

/**
 * Validate a set of updates against a set of validators.
 */
export function validateUpdates<T extends Data>(unsafeUpdates: Updates<T>, validators: Validators<T>): Updates<T> {
	return Object.fromEntries(validateUpdateProps(unsafeUpdates, validators)) as Updates<T>;
}
function* validateUpdateProps<T extends Data>(unsafeUpdates: Updates<T>, validators: Validators<T>): Iterable<DataProp<Updates<T>>> {
	let valid = true;
	const feedbacks: MutableDictionary<Feedback> = {};
	for (const [key, validator] of getDataProps(validators)) {
		const unsafeUpdate = unsafeUpdates[key];
		if (unsafeUpdate !== undefined) {
			try {
				yield [key, unsafeUpdate instanceof Update ? unsafeUpdate.validate(validator) : validate(unsafeUpdate, validator)];
			} catch (thrown) {
				if (!isFeedback(thrown)) throw thrown;
				feedbacks[key] = thrown;
				valid = false;
			}
		}
	}
	if (!valid) throw new Feedbacks(feedbacks, unsafeUpdates);
}

/** Update data using a set of updates. */
export const updateData: <T extends Data>(data: T, updates: Updates<T>) => T = transformObject;

/**
 * Update that can be applied to a data object to update its props.
 */
export class DataUpdate<T extends Data = Data> extends Update<T> implements Iterable<DataProp<Updates<T>>>, Transformable<T, T> {
	/** Return a data update with a specific prop marked for update. */
	static update<X extends Data, K extends DataKey<X>>(key: Nullish<K>, value: X[K] | Update<X[K]>): DataUpdate<X> {
		return new DataUpdate<X>(!isNullish(key) ? ({ [key]: value } as Updates<X>) : {});
	}

	readonly updates: Updates<T>;
	constructor(props: Updates<T>) {
		super();
		this.updates = props;
	}

	/** Return a data update with a specific prop marked for update. */
	update<K extends DataKey<T>>(key: Nullish<K>, value: T[K] | Update<T[K]>): this {
		if (isNullish(key)) return this;
		return {
			__proto__: getPrototype(this),
			...this,
			updates: { ...this.updates, [key]: value },
		};
	}

	// Implement `Transformable`
	transform(data: T): T {
		return updateData<T>(data, this.updates);
	}

	// Implement `Validatable`
	override validate(validator: Validator<T>): this {
		if (!(validator instanceof DataSchema)) return super.validate(validator);
		return {
			__proto__: getPrototype(this),
			...this,
			updates: validateUpdates(this.updates, validator.props),
		};
	}

	// Implement `Iterable`
	[Symbol.iterator](): Iterator<DataProp<{ readonly [K in keyof T]: T[K] | Update<T[K]> }>, void> {
		return Object.entries(this.updates).values();
	}
}
