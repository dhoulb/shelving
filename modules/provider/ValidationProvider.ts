import type { DataDocument, DataQuery } from "../db/index.js";
import { Data, Result, Unsubscriber, Observer, Validator, validate, ValidateObserver, Results, callAsync } from "../util/index.js";
import { Transform, validateTransform } from "../transform/index.js";
import { throwFeedback } from "../feedback/index.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Validates any values that are read from or written to a source provider. */
export class ValidationProvider extends ThroughProvider {
	override get<T extends Data>(ref: DataDocument<T>): Result<T> | PromiseLike<Result<T>> {
		return callAsync(validate, super.get(ref), ref);
	}
	override subscribe<T extends Data>(ref: DataDocument<T>, observer: Observer<Result>): Unsubscriber {
		return super.subscribe(ref, new ValidateObserver(ref, observer));
	}
	override add<T extends Data>(ref: DataQuery<T>, data: T): string | PromiseLike<string> {
		return super.add(ref, throwFeedback(validate(data, ref.validator)));
	}
	override write<T extends Data>(ref: DataDocument<T>, value: T | Transform<T> | undefined): void | PromiseLike<void> {
		return super.write(ref, value ? _validateWrite(value, ref.validator) : value);
	}
	override getQuery<T extends Data>(ref: DataQuery<T>): Results<T> | PromiseLike<Results<T>> {
		return callAsync(validate, super.getQuery(ref), ref);
	}
	override subscribeQuery<T extends Data>(ref: DataQuery<T>, observer: Observer<Results<T>>): Unsubscriber {
		return super.subscribeQuery(ref, new ValidateObserver(ref, observer));
	}
	override writeQuery<T extends Data>(ref: DataQuery<T>, value: T | Transform<T> | undefined): void | PromiseLike<void> {
		return super.writeQuery(ref, value ? _validateWrite(value, ref.validator) : value);
	}
}

/** Validate data or a transform for a path. */
function _validateWrite<T extends Data>(value: T | Transform<T>, validator: Validator<T>): T | Transform<T> {
	return throwFeedback(value instanceof Transform ? validateTransform(value, validator) : validate(value, validator));
}
