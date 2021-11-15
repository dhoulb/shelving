import type { ModelDocument, ModelQuery } from "../db/index.js";
import { Data, Result, Results, Unsubscriber, Observer, isAsync, Validator, validate, Transformer } from "../util/index.js";
import { Transform, validateTransformer } from "../transform/index.js";
import { DeriveStream } from "../stream/index.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Validates any values that are read from or written to a source provider. */
export class ValidationProvider extends ThroughProvider {
	override get<T extends Data>(ref: ModelDocument<T>): Result<T> | Promise<Result<T>> {
		const result = super.get(ref);
		if (isAsync(result)) return this._awaitGetDocument(ref, result);
		return ref.validate(result);
	}
	private async _awaitGetDocument<T extends Data>(ref: ModelDocument<T>, asyncResult: Promise<Result<T>>): Promise<Result<T>> {
		const result = await asyncResult;
		return ref.validate(result);
	}
	override subscribe<T extends Data>(ref: ModelDocument<T>, observer: Observer<Result>): Unsubscriber {
		const stream = new DeriveStream<Result<T>, Result<T>>(v => ref.validate(v));
		stream.subscribe(observer);
		return super.subscribe(ref, stream);
	}
	override add<T extends Data>(ref: ModelQuery<T>, data: T): string | Promise<string> {
		return super.add(ref, validate(data, ref.validator));
	}
	override write<T extends Data>(ref: ModelDocument<T>, value: T | Transformer<T> | undefined): void | Promise<void> {
		return super.write(ref, value ? validateWrite(value, ref.validator) : value);
	}
	override getQuery<T extends Data>(ref: ModelQuery<T>): Results<T> | Promise<Results<T>> {
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
	override writeQuery<T extends Data>(ref: ModelQuery<T>, value: T | Transformer<T> | undefined): void | Promise<void> {
		return super.writeQuery(ref, value ? validateWrite(value, ref.validator) : value);
	}
}

/** Validate data or a transform for a path. */
function validateWrite<T extends Data>(value: T | Transformer<T>, validator: Validator<T>): T | Transformer<T> {
	return value instanceof Transform ? validateTransformer(value, validator) : validate(value, validator);
}
