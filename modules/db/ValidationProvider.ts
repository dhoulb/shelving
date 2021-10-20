import { Data, Result, Results, Unsubscriber, MutableObject, Observer, isAsync, isObject, Transforms, isTransform, Transform } from "../util/index.js";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback/index.js";
import { Stream } from "../stream/index.js";
import type { Provider } from "./Provider.js";
import type { Document } from "./Document.js";
import type { Documents } from "./Documents.js";
import { ReferenceValidationError } from "./errors.js";

/**
 * Validation provider: validates any values that are read from or written a the source provider.
 */
export class ValidationProvider implements Provider {
	private readonly _source: Provider;
	constructor(source: Provider) {
		this._source = source;
	}
	getDocument<X extends Data>(ref: Document<X>): Result<X> | Promise<Result<X>> {
		const result = this._source.getDocument(ref);
		if (isAsync(result)) return this._awaitGetDocument(ref, result);
		return validateResult(ref, result);
	}
	private async _awaitGetDocument<X extends Data>(ref: Document<X>, asyncResult: Promise<Result<X>>): Promise<Result<X>> {
		const result = await asyncResult;
		return validateResult(ref, result);
	}
	onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result>): Unsubscriber {
		const stream = Stream.derive<Result<X>, Result<X>>(v => validateResult(ref, v));
		stream.subscribe(observer);
		return this._source.onDocument(ref, stream);
	}
	addDocument<X extends Data>(ref: Documents<X>, data: X): string | Promise<string> {
		return this._source.addDocument(ref, validateData(ref, data));
	}
	setDocument<X extends Data>(ref: Document<X>, data: X): void | Promise<void> {
		return this._source.setDocument(ref, validateData(ref, data));
	}
	updateDocument<X extends Data>(ref: Document<X>, transforms: Transforms<X>): void | Promise<void> {
		return this._source.updateDocument(ref, validateTransforms(ref, transforms));
	}
	deleteDocument<X extends Data>(ref: Document<X>): void | Promise<void> {
		return this._source.deleteDocument(ref);
	}
	getDocuments<X extends Data>(ref: Documents<X>): Results<X> | Promise<Results<X>> {
		const results = this._source.getDocuments(ref);
		if (isAsync(results)) return this._awaitGetDocuments(ref, results);
		return validateResults<X>(ref, results);
	}
	private async _awaitGetDocuments<X extends Data>(ref: Documents<X>, asyncResult: Promise<Results<X>>): Promise<Results<X>> {
		return validateResults<X>(ref, await asyncResult);
	}
	onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): Unsubscriber {
		const stream = Stream.derive<Results<X>, Results<X>>(v => validateResults(ref, v));
		stream.subscribe(observer);
		return this._source.onDocuments(ref, stream);
	}
	setDocuments<X extends Data>(ref: Documents<X>, data: X): void | Promise<void> {
		return this._source.setDocuments(ref, ref.validate(data));
	}
	updateDocuments<X extends Data>(ref: Documents<X>, transforms: Transforms<X>): void | Promise<void> {
		return this._source.updateDocuments(ref, validateTransforms(ref, transforms));
	}
	deleteDocuments<X extends Data>(ref: Documents<X>): void | Promise<void> {
		return this._source.deleteDocuments(ref);
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
		schema.validate(result);
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
