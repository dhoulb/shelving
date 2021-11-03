import { Data, Result, Results, Unsubscriber, MutableObject, Observer, isAsync, isObject, Transforms, isTransform, Transform } from "../util/index.js";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback/index.js";
import { DeriveStream } from "../stream/index.js";
import type { Document } from "./Document.js";
import type { Documents } from "./Documents.js";
import type { Provider } from "./Provider.js";
import { ThroughProvider } from "./ThroughProvider.js";
import { ReferenceValidationError } from "./errors.js";

/**
 * Validates any values that are read from or written to a source provider.
 */
export class ValidationProvider extends ThroughProvider implements Provider {
	override getDocument<X extends Data>(ref: Document<X>): Result<X> | Promise<Result<X>> {
		const result = super.getDocument(ref);
		if (isAsync(result)) return this._awaitGetDocument(ref, result);
		return validateResult(ref, result);
	}
	private async _awaitGetDocument<X extends Data>(ref: Document<X>, asyncResult: Promise<Result<X>>): Promise<Result<X>> {
		const result = await asyncResult;
		return validateResult(ref, result);
	}
	override onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result>): Unsubscriber {
		const stream = new DeriveStream<Result<X>, Result<X>>(v => validateResult(ref, v));
		stream.subscribe(observer);
		return super.onDocument(ref, stream);
	}
	override addDocument<X extends Data>(ref: Documents<X>, data: X): string | Promise<string> {
		return super.addDocument(ref, validateData(ref, data));
	}
	override setDocument<X extends Data>(ref: Document<X>, data: X): void | Promise<void> {
		return super.setDocument(ref, validateData(ref, data));
	}
	override updateDocument<X extends Data>(ref: Document<X>, transforms: Transforms<X>): void | Promise<void> {
		return super.updateDocument(ref, validateTransforms(ref, transforms));
	}
	override getDocuments<X extends Data>(ref: Documents<X>): Results<X> | Promise<Results<X>> {
		const results = super.getDocuments(ref);
		if (isAsync(results)) return this._awaitGetDocuments(ref, results);
		return validateResults<X>(ref, results);
	}
	private async _awaitGetDocuments<X extends Data>(ref: Documents<X>, asyncResult: Promise<Results<X>>): Promise<Results<X>> {
		return validateResults<X>(ref, await asyncResult);
	}
	override onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): Unsubscriber {
		const stream = new DeriveStream<Results<X>, Results<X>>(v => validateResults(ref, v));
		stream.subscribe(observer);
		return super.onDocuments(ref, stream);
	}
	override setDocuments<X extends Data>(ref: Documents<X>, data: X): void | Promise<void> {
		return super.setDocuments(ref, ref.validate(data));
	}
	override updateDocuments<X extends Data>(ref: Documents<X>, transforms: Transforms<X>): void | Promise<void> {
		return super.updateDocuments(ref, validateTransforms(ref, transforms));
	}
}

/** Validate a set of data for a path. */
function validateData<X extends Data>(ref: Document<X> | Documents<X>, data: X): X {
	return ref.schema.validate(data);
}

/** Validate a set of transforms for a path. */
function validateTransforms<X extends Data>(ref: Document<X> | Documents<X>, unsafeTransforms: Transforms<X>): Transforms<X> {
	if (!isObject(unsafeTransforms)) throw new InvalidFeedback("Must be object", { value: unsafeTransforms });
	const schema = ref.schema;
	let changed = false;
	let invalid = false;
	const safeTransforms: MutableObject<Transform | X[keyof X]> = {};
	const details: MutableObject = {};
	const validators = Object.entries(schema.props);
	for (const [key, validator] of validators) {
		const unsafeTransform = unsafeTransforms[key];
		if (unsafeTransform === undefined) {
			continue; // Skip undefined.
		} else if (isTransform(unsafeTransform)) {
			safeTransforms[key] = unsafeTransform;
		} else {
			try {
				const safeTransform = validator.validate(unsafeTransform);
				if (safeTransform !== unsafeTransform) changed = true;
				safeTransforms[key] = safeTransform;
			} catch (feedback: unknown) {
				invalid = true;
				details[key] = feedback;
			}
		}
	}
	if (Object.keys(unsafeTransforms).length > validators.length) changed = true;
	if (invalid) throw new InvalidFeedback("Invalid transforms", details);
	return changed ? (safeTransforms as Transforms<X>) : unsafeTransforms;
}

/** Validate a result for a path. */
function validateResult<X extends Data>(ref: Document<X>, result: Result<X>): Result<X> {
	if (!result) return undefined;
	const schema = ref.schema;
	try {
		return schema.validate(result);
	} catch (err: unknown) {
		throw isFeedback(err) ? new ReferenceValidationError(ref, err) : err;
	}
}

/** Validate a set of results for a path. */
function validateResults<X extends Data>(ref: Documents<X>, results: Results<X>): Results<X> {
	const schema = ref.schema;
	const validated: MutableObject<X> = {};
	const invalids: MutableObject<Feedback> = {};
	let invalid = false;
	for (const [id, data] of Object.entries(results)) {
		try {
			validated[id] = schema.validate(data);
		} catch (thrown) {
			if (isFeedback(thrown)) {
				invalids[id] = thrown;
				invalid = true;
			} else throw thrown;
		}
	}
	if (invalid) throw new ReferenceValidationError(ref, new InvalidFeedback("Invalid documents", invalids));
	return validated;
}
