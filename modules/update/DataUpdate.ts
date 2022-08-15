import { Feedback, isFeedback } from "../feedback/Feedback.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { DataSchema } from "../schema/DataSchema.js";
import { Data, getProps, Key, Prop } from "../util/data.js";
import { isNullish, Nullish } from "../util/null.js";
import { Transformable, transformData } from "../util/transform.js";
import { validate, Validator, Validators } from "../util/validate.js";
import { Update } from "./Update.js";

/**
 * Set of named transforms for the props of a data object.
 * - Named transforms probably correspond to the properties of an object.
 * - If a prop contains a new value, the prop is set to that new value.
 * - If a prop contains a transform, the existing value is transformed.
 * - This is a subset of `Dispatchers`
 */
export type Updates<T extends Data = Data> = { readonly [K in keyof T]?: T[K] | Update<T[K]> };

/**
 * Validate a set of updates against a set of validators.
 */
export function validateUpdates<T extends Data>(unsafeUpdates: Updates<T>, validators: Validators<T>) {
	return Object.fromEntries(_validateUpdates(unsafeUpdates, validators));
}
function* _validateUpdates<T extends Data>(unsafeUpdates: Updates<T>, validators: Validators<T>): Iterable<Prop<Updates<T>>> {
	const feedbacks = new Map<string, Feedback>();
	for (const [key, validator] of getProps(validators)) {
		const unsafeUpdate = unsafeUpdates[key];
		if (unsafeUpdate !== undefined) {
			try {
				yield [key, unsafeUpdate instanceof Update ? unsafeUpdate.validate(validator) : validate(unsafeUpdate, validator)];
			} catch (thrown) {
				if (!isFeedback(thrown)) throw thrown;
				feedbacks.set(key, thrown);
			}
		}
	}
	if (feedbacks.size) throw new InvalidFeedback("Invalid updates", feedbacks);
}

/**
 * Update that can be applied to a data object to update its props.
 */
export class DataUpdate<T extends Data = Data> extends Update<T> implements Iterable<Prop<Updates<T>>>, Transformable<T, T> {
	/** Return a data update with a specific prop marked for update. */
	static with<X extends Data, K extends Key<X>>(key: Nullish<K>, value: X[K] | Update<X[K]>): DataUpdate<X> {
		return new DataUpdate<X>(!isNullish(key) ? ({ [key]: value } as Updates<X>) : {});
	}

	readonly updates: Updates<T>;
	constructor(props: Updates<T>) {
		super();
		this.updates = props;
	}

	transform(data: T): T {
		return transformData<T>(data, this.updates);
	}

	override validate(validator: Validator<T>): this {
		if (!(validator instanceof DataSchema)) return super.validate(validator);
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			updates: validateUpdates(this.updates, validator.props),
		};
	}

	/** Return a data update with a specific prop marked for update. */
	with<K extends Key<T>>(key: Nullish<K>, value: T[K] | Update<T[K]>): this {
		if (isNullish(key)) return this;
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			updates: { ...this.updates, [key]: value },
		};
	}

	/** Iterate over the transforms in this object. */
	[Symbol.iterator](): Iterator<Prop<Updates<T>>, void> {
		return Object.entries(this.updates).values();
	}
}
