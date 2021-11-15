import { Feedback } from "../feedback/Feedback.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { ObjectSchema } from "../schema/ObjectSchema.js";
import { ObjectTransform } from "../transform/index.js";
import {
	getProps,
	ImmutableObject,
	isTransformer,
	MutableObject,
	Transformer,
	MutableTransformers,
	transform,
	Transformers,
	validate,
	Validator,
	Validators,
} from "../util/index.js";

/**
 * Validate a transform instance.
 * - Runs the transform to
 * - Recurses into the props of a `ObjectTransform` if a `ObjectSchema` validator is also provided with corresponding props.
 */
export function validateTransformer<T>(unsafeTransformer: Transformer<T>, validator: Validator<T>): Transformer<T> {
	if (validator instanceof ObjectSchema && unsafeTransformer instanceof ObjectTransform) {
		// Validate the object transform's props against the object validator's props.
		const safeTransformers = validateTransformers(unsafeTransformer.props, validator.props);
		return safeTransformers === unsafeTransformer.props ? unsafeTransformer : new ObjectTransform(safeTransformers);
	} else {
		validate(transform(undefined, unsafeTransformer), validator);
		return unsafeTransformer;
	}
}

/** Validate a set of `Transforms` against a set of `Validators`. */
export function validateTransformers<T extends ImmutableObject>(unsafeTransformers: Transformers<T>, validators: Validators<T>): Transformers<T> {
	// Validate `unsafeTransforms` against `validators`
	const safeTransformers: MutableTransformers<T> = {};
	let changed = false;
	const details: MutableObject = {};
	let invalid = false;
	for (const [k, unsafeTransform] of getProps(unsafeTransformers) as [keyof T & string, T[string] | Transformer<T[string]>][]) {
		const validator = validators[k];
		if (validator) {
			try {
				const safeTransform = isTransformer(unsafeTransform) ? validateTransformer(unsafeTransform, validator) : validate(unsafeTransform, validator);
				if (safeTransform !== unsafeTransform) changed = true;
				safeTransformers[k] = safeTransform;
			} catch (thrown) {
				if (thrown instanceof Feedback) {
					invalid = true;
					details[k] = thrown;
				} else throw thrown;
			}
		} else {
			// Prop didn't exist in `validators`
			changed = true;
		}
	}

	// If any validator threw a Feedback, throw a Feedback.
	if (invalid) throw new InvalidFeedback("Invalid transforms", details);

	// Return object (same instance if no changes were made).
	return changed ? safeTransformers : unsafeTransformers;
}
