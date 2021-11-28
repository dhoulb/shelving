import type { DatabaseDocument, DatabaseQuery } from "../db/index.js";
import { Data, Result, Results, Unsubscriber, Observer, isAsync, Validator, validate, Datas, Key } from "../util/index.js";
import { Transform, validateTransform } from "../transform/index.js";
import { throwFeedback } from "../feedback/index.js";
import { ValidateStream } from "../stream/index.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Validates any values that are read from or written to a source provider. */
export class ValidationProvider<D extends Datas> extends ThroughProvider<D> {
	override get<C extends Key<D>>(ref: DatabaseDocument<D, C>): Result<D[C]> | Promise<Result<D[C]>> {
		const result = super.get(ref);
		return isAsync(result) ? _awaitResult(ref, result) : result && ref.validate(result);
	}
	override subscribe<C extends Key<D>>(ref: DatabaseDocument<D, C>, observer: Observer<Result>): Unsubscriber {
		const stream = new ValidateStream(ref);
		stream.on(observer);
		return super.subscribe(ref, stream);
	}
	override add<C extends Key<D>>(ref: DatabaseQuery<D, C>, data: D[C]): string | Promise<string> {
		return super.add(ref, throwFeedback(validate(data, ref.validator)));
	}
	override write<C extends Key<D>>(ref: DatabaseDocument<D, C>, value: D[C] | Transform<D[C]> | undefined): void | Promise<void> {
		return super.write(ref, value ? _validateWrite(value, ref.validator) : value);
	}
	override getQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>): Results<D[C]> | Promise<Results<D[C]>> {
		const results = super.getQuery(ref);
		return isAsync(results) ? _awaitResults(ref, results) : ref.validate(results);
	}
	override subscribeQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>, observer: Observer<Results<D[C]>>): Unsubscriber {
		const stream = new ValidateStream(ref);
		stream.subscribe(observer);
		return super.subscribeQuery(ref, stream);
	}
	override writeQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>, value: D[C] | Transform<D[C]> | undefined): void | Promise<void> {
		return super.writeQuery(ref, value ? _validateWrite(value, ref.validator) : value);
	}
}

async function _awaitResult<D extends Datas, C extends Key<D>>(ref: DatabaseDocument<D, C>, asyncResult: Promise<Result<D[C]>>): Promise<Result<D[C]>> {
	const result = await asyncResult;
	return result && ref.validate(result);
}

async function _awaitResults<D extends Datas, C extends Key<D>>(ref: DatabaseQuery<D, C>, asyncResult: Promise<Results<D[C]>>): Promise<Results<D[C]>> {
	return ref.validate(await asyncResult);
}

/** Validate data or a transform for a path. */
function _validateWrite<T extends Data>(value: T | Transform<T>, validator: Validator<T>): T | Transform<T> {
	return throwFeedback(value instanceof Transform ? validateTransform(value, validator) : validate(value, validator));
}
