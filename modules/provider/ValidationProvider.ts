import type { DatabaseDocument, DatabaseQuery } from "../db/index.js";
import { Data, Result, Unsubscriber, Observer, Validator, validate, Datas, Key, ValidateObserver, Results, validateAsync } from "../util/index.js";
import { Transform, validateTransform } from "../transform/index.js";
import { throwFeedback } from "../feedback/index.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Validates any values that are read from or written to a source provider. */
export class ValidationProvider<D extends Datas> extends ThroughProvider<D> {
	override get<C extends Key<D>>(ref: DatabaseDocument<D, C>): Result<D[C]> | Promise<Result<D[C]>> {
		return validateAsync(super.get(ref), ref);
	}
	override subscribe<C extends Key<D>>(ref: DatabaseDocument<D, C>, observer: Observer<Result>): Unsubscriber {
		return super.subscribe(ref, new ValidateObserver(ref, observer));
	}
	override add<C extends Key<D>>(ref: DatabaseQuery<D, C>, data: D[C]): string | Promise<string> {
		return super.add(ref, throwFeedback(validate(data, ref.validator)));
	}
	override write<C extends Key<D>>(ref: DatabaseDocument<D, C>, value: D[C] | Transform<D[C]> | undefined): void | Promise<void> {
		return super.write(ref, value ? _validateWrite(value, ref.validator) : value);
	}
	override getQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>): Results<D[C]> | Promise<Results<D[C]>> {
		return validateAsync(super.getQuery(ref), ref);
	}
	override subscribeQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>, observer: Observer<Results<D[C]>>): Unsubscriber {
		return super.subscribeQuery(ref, new ValidateObserver(ref, observer));
	}
	override writeQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>, value: D[C] | Transform<D[C]> | undefined): void | Promise<void> {
		return super.writeQuery(ref, value ? _validateWrite(value, ref.validator) : value);
	}
}

/** Validate data or a transform for a path. */
function _validateWrite<T extends Data>(value: T | Transform<T>, validator: Validator<T>): T | Transform<T> {
	return throwFeedback(value instanceof Transform ? validateTransform(value, validator) : validate(value, validator));
}
