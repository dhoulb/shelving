import { Feedback } from "../feedback/Feedback.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { DataSchema } from "../schema/DataSchema.js";
import { MutableObject, transform, validate, Validator, Validators, toProps, Data } from "../util/index.js";
import { DataUpdate, Update, PropUpdates } from "./index.js";

/** Validate an update against a validator. */
export function validateUpdate<T>(unsafeUpdate: Update<T> | DataUpdate<T & Data>, validator: Validator<T> | DataSchema<T & Data>): Update<T> {
	if (validator instanceof DataSchema && unsafeUpdate instanceof DataUpdate) {
		const unsafeUpdates = unsafeUpdate.props;
		const safeUpdates = validateUpdates<T & Data>(unsafeUpdates, validator.props);
		return safeUpdates === unsafeUpdates ? unsafeUpdate : new DataUpdate(safeUpdates);
	} else {
		validate(transform(undefined, unsafeUpdate), validator);
		return unsafeUpdate;
	}
}

/** Validate a set of transforms against a set of validators. */
export function validateUpdates<T extends Data>(unsafeUpdates: PropUpdates<T>, validators: Validators<T>): PropUpdates<T> {
	let invalid = false;
	const safeUpdates: { [K in keyof T]?: T[K] | Update<T[K]> } = {};
	const details: MutableObject = {};
	for (const [k, validator] of toProps(validators)) {
		const unsafeUpdate = unsafeUpdates[k];
		if (unsafeUpdate !== undefined) {
			try {
				safeUpdates[k] = unsafeUpdate instanceof Update ? validateUpdate(unsafeUpdate, validator) : validate(unsafeUpdate, validator);
			} catch (thrown) {
				if (thrown instanceof Feedback) {
					invalid = true;
					details[k] = thrown;
				} else throw thrown;
			}
		}
	}
	if (invalid) throw new InvalidFeedback("Invalid transforms", details);
	return safeUpdates;
}
