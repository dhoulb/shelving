import { Feedback } from "../feedback/Feedback.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { DataSchema } from "../schema/DataSchema.js";
import { DataTransform, Transform, Transforms } from "../transform/index.js";
import { MutableObject, derive, validate, Validator, Validators, toProps, Data } from "../util/index.js";

/** Validate a transform against a validator. */
export function validateTransform<T>(unsafeTransform: Transform<T> | DataTransform<T & Data>, validator: Validator<T> | DataSchema<T & Data>): Transform<T> {
	if (validator instanceof DataSchema && unsafeTransform instanceof DataTransform) {
		const unsafeTransforms = unsafeTransform.transforms;
		const safeTransforms = validateTransforms<T & Data>(unsafeTransforms, validator.props);
		return safeTransforms === unsafeTransforms ? unsafeTransform : new DataTransform(safeTransforms);
	} else {
		validate(derive(undefined, unsafeTransform), validator);
		return unsafeTransform;
	}
}

/** Validate a set of transforms against a set of validators. */
export function validateTransforms<T extends Data>(unsafeTransforms: Transforms<T>, validators: Validators<T>): Transforms<T> {
	let invalid = false;
	const safeTransforms: { [K in keyof T]?: T[K] | Transform<T[K]> } = {};
	const details: MutableObject = {};
	for (const [k, validator] of toProps(validators)) {
		const unsafeTransform = unsafeTransforms[k];
		if (unsafeTransform !== undefined) {
			try {
				safeTransforms[k] = unsafeTransform instanceof Transform ? validateTransform(unsafeTransform, validator) : validate(unsafeTransform, validator);
			} catch (thrown) {
				if (thrown instanceof Feedback) {
					invalid = true;
					details[k] = thrown;
				} else throw thrown;
			}
		}
	}
	if (invalid) throw new InvalidFeedback("Invalid transforms", details);
	return safeTransforms;
}
