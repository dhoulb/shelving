import {
	Data,
	Result,
	Results,
	Unsubscriber,
	MutableObject,
	Observer,
	isAsync,
	isObject,
	Transforms,
	Transform,
	InvalidFeedback,
	assertInstance,
	MutableTransforms,
	Validator,
} from "../util/index.js";
import { DeriveStream } from "../stream/index.js";
import { ObjectSchema } from "../index.js";
import type { ModelDocument, ModelQuery } from "../db/index.js";
import type { Provider } from "./Provider.js";
import { ThroughProvider } from "./ThroughProvider.js";

/**
 * Validates any values that are read from or written to a source provider.
 */
export class ValidationProvider extends ThroughProvider implements Provider {
	override get<X extends Data>(ref: ModelDocument<X>): Result<X> | Promise<Result<X>> {
		const result = super.get(ref);
		if (isAsync(result)) return this._awaitGetDocument(ref, result);
		return ref.validate(result);
	}
	private async _awaitGetDocument<X extends Data>(ref: ModelDocument<X>, asyncResult: Promise<Result<X>>): Promise<Result<X>> {
		const result = await asyncResult;
		return ref.validate(result);
	}
	override subscribe<X extends Data>(ref: ModelDocument<X>, observer: Observer<Result>): Unsubscriber {
		const stream = new DeriveStream<Result<X>, Result<X>>(v => ref.validate(v));
		stream.subscribe(observer);
		return super.subscribe(ref, stream);
	}
	override add<X extends Data>(ref: ModelQuery<X>, data: X): string | Promise<string> {
		return super.add(ref, ref.schema.validate(data));
	}
	override set<X extends Data>(ref: ModelDocument<X>, data: X): void | Promise<void> {
		return super.set(ref, ref.schema.validate(data));
	}
	override update<X extends Data>(ref: ModelDocument<X>, transforms: Transforms<X>): void | Promise<void> {
		return super.update(ref, validateTransforms(ref, transforms));
	}
	override getQuery<X extends Data>(ref: ModelQuery<X>): Results<X> | Promise<Results<X>> {
		const results = super.getQuery(ref);
		if (isAsync(results)) return this._awaitGetDocuments(ref, results);
		return ref.validate(results);
	}
	private async _awaitGetDocuments<X extends Data>(ref: ModelQuery<X>, asyncResult: Promise<Results<X>>): Promise<Results<X>> {
		return ref.validate(await asyncResult);
	}
	override subscribeQuery<X extends Data>(ref: ModelQuery<X>, observer: Observer<Results<X>>): Unsubscriber {
		const stream = new DeriveStream<Results<X>, Results<X>>(v => ref.validate(v));
		stream.subscribe(observer);
		return super.subscribeQuery(ref, stream);
	}
	override setQuery<X extends Data>(ref: ModelQuery<X>, data: X): void | Promise<void> {
		return super.setQuery(ref, ref.schema.validate(data));
	}
	override updateQuery<X extends Data>(ref: ModelQuery<X>, transforms: Transforms<X>): void | Promise<void> {
		return super.updateQuery(ref, validateTransforms(ref, transforms));
	}
}

/** Validate a set of transforms for a path. */
function validateTransforms<X extends Data>(ref: ModelDocument<X> | ModelQuery<X>, unsafeTransforms: Transforms<X>): Transforms<X> {
	if (!isObject(unsafeTransforms)) throw new InvalidFeedback("Must be object", { value: unsafeTransforms });
	const schema = ref.schema;
	assertInstance<ObjectSchema<X>>(schema, ObjectSchema);
	let changed = false;
	let invalid = false;
	const safeTransforms: MutableTransforms<X> = {};
	const details: MutableObject = {};
	const validators: [keyof X & string, Validator<X[string]>][] = Object.entries(schema.props);
	for (const [key, validator] of validators) {
		const unsafeTransform = unsafeTransforms[key];
		if (unsafeTransform === undefined) {
			continue; // Skip undefined.
		} else if (unsafeTransform instanceof Transform) {
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
	return changed ? safeTransforms : unsafeTransforms;
}
