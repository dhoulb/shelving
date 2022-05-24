import { Feedback } from "../feedback/Feedback.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { DataSchema } from "../schema/DataSchema.js";
import { Data, toProps } from "../util/data.js";
import { validate, Validator, Validators } from "../util/validate.js";
import { transform } from "../util/transform.js";
import { MutableObject } from "../util/object.js";
import { DataUpdate, PropUpdates } from "./DataUpdate.js";
import { Update } from "./Update.js";

/**
 * Validate an update against a validator.
 * -
 */
export function validateUpdate<T extends Data>(unsafeUpdate: DataUpdate<T>, validator: Validator<T>): DataUpdate<T>;
export function validateUpdate<T>(unsafeUpdate: Update<T>, validator: Validator<T>): Update<T>;
export function validateUpdate<T>(unsafeUpdate: Update<T>, validator: Validator<T>): Update<T> {
	if (validator instanceof DataSchema && unsafeUpdate instanceof DataUpdate) {
		const unsafeUpdates = unsafeUpdate.updates;
		const safeUpdates = validatePropUpdates<T & Data>(unsafeUpdates, validator.props);
		return safeUpdates === unsafeUpdates ? unsafeUpdate : new DataUpdate(safeUpdates);
	} else {
		validate(transform(undefined, unsafeUpdate), validator);
		return unsafeUpdate;
	}
}

/** Validate a set of transforms against a set of validators. */
function validatePropUpdates<T extends Data>(unsafeUpdates: PropUpdates<T>, validators: Validators<T>): PropUpdates<T> {
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
