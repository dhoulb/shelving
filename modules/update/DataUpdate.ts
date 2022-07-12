import { Feedback } from "../feedback/Feedback.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { DataSchema } from "../schema/DataSchema.js";
import { Data, getProps, Key, Prop } from "../util/data.js";
import { isNullish, Nullish } from "../util/null.js";
import { MutableObject } from "../util/object.js";
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
export type PropUpdates<T extends Data> = { readonly [K in keyof T]?: T[K] | Update<T[K]> };

/** Update that can be applied to a data object to update its props. */
export class DataUpdate<T extends Data> extends Update<T> implements Iterable<Prop<PropUpdates<T>>>, Transformable<T, T> {
	/** Return a data update with a specific prop marked for update. */
	static with<X extends Data, K extends Key<X>>(key: Nullish<K>, value: X[K] | Update<X[K]>): DataUpdate<X> {
		return new DataUpdate<X>(!isNullish(key) ? ({ [key]: value } as PropUpdates<X>) : {});
	}

	readonly updates: PropUpdates<T>;
	constructor(props: PropUpdates<T>) {
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
			updates: Object.fromEntries(_validateUpdates(this.updates, validator.props)),
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
	[Symbol.iterator](): Iterator<Prop<PropUpdates<T>>, void> {
		return Object.entries(this.updates).values();
	}
}

/** Validate a set of transforms against a set of validators. */
function* _validateUpdates<T extends Data>(unsafeUpdates: PropUpdates<T>, validators: Validators<T>): Iterable<Prop<PropUpdates<T>>> {
	let invalid = false;
	const details: MutableObject = {};
	for (const [k, validator] of getProps(validators)) {
		const unsafeUpdate = unsafeUpdates[k];
		if (unsafeUpdate !== undefined) {
			try {
				yield [k, unsafeUpdate instanceof Update ? unsafeUpdate.validate(validator) : validate(unsafeUpdate, validator)];
			} catch (thrown) {
				if (thrown instanceof Feedback) {
					invalid = true;
					details[k] = thrown;
				} else throw thrown;
			}
		}
	}
	if (invalid) throw new InvalidFeedback("Invalid updates", details);
}
