import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { Data, Result, Entity } from "../util/data.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { MutableObject } from "../util/object.js";
import { callAsync } from "../util/async.js";
import { validate } from "../util/validate.js";
import { Observer, TransformableObserver, Unsubscriber } from "../util/observe.js";
import { validateUpdate } from "../update/util.js";
import { Feedback } from "../feedback/Feedback.js";
import { ValidationError } from "../error/ValidationError.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Validates any values that are read from or written to a source provider. */
export class ValidationProvider extends ThroughProvider {
	override get<T extends Data>(ref: DocumentReference<T>): Result<Entity<T>> | PromiseLike<Result<Entity<T>>> {
		return callAsync(_validateResult, super.get(ref), ref);
	}
	override subscribe<T extends Data>(ref: DocumentReference<T>, observer: Observer<Result>): Unsubscriber {
		return super.subscribe(ref, new ValidateResultObserver(ref, observer));
	}
	override add<T extends Data>(ref: QueryReference<T>, data: T): string | PromiseLike<string> {
		return super.add(ref, validate(data, ref.validator));
	}
	override set<T extends Data>(ref: DocumentReference<T>, value: T): void | PromiseLike<void> {
		return super.set(ref, validate(value, ref.validator));
	}
	override update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): void | PromiseLike<void> {
		return super.update<T>(ref, validateUpdate(update, ref.validator));
	}
	override getQuery<T extends Data>(ref: QueryReference<T>): Iterable<Entity<T>> | PromiseLike<Iterable<Entity<T>>> {
		return callAsync(_validateResults, super.getQuery(ref), ref);
	}
	override subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: Observer<Iterable<Entity<T>>>): Unsubscriber {
		return super.subscribeQuery(ref, new ValidateResultsObserver(ref, observer));
	}
	override setQuery<T extends Data>(ref: QueryReference<T>, value: T): number | PromiseLike<number> {
		return super.setQuery(ref, validate(value, ref.validator));
	}
	override updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): number | PromiseLike<number> {
		return super.updateQuery(ref, validateUpdate(update, ref.validator));
	}
}

/** Validate a result for a document reference. */
function _validateResult<T extends Data>(unsafeResult: Result<Entity>, ref: DocumentReference<T>): Result<Entity<T>> {
	if (!unsafeResult) return null;
	try {
		return { ...validate(unsafeResult, ref.validator), id: unsafeResult.id };
	} catch (thrown) {
		throw thrown instanceof Feedback ? new ValidationError(`Invalid data for ${ref.toString()}`, thrown) : thrown;
	}
}

/** Observer that validates received results. */
class ValidateResultObserver<T extends Data> extends TransformableObserver<Result<Entity>, Result<Entity<T>>> {
	protected _ref: DocumentReference<T>;
	constructor(ref: DocumentReference<T>, observer: Observer<Result<Entity<T>>>) {
		super(observer);
		this._ref = ref;
	}
	transform(unsafeResult: Result<Entity>): Result<Entity<T>> {
		return _validateResult(unsafeResult, this._ref);
	}
}

/** Validate a set of results for this query reference. */
function* _validateResults<T extends Data>(unsafeEntities: Iterable<Entity>, ref: QueryReference<T>): Iterable<Entity<T>> {
	let invalid = false;
	const details: MutableObject<Feedback> = {};
	for (const unsafeEntity of unsafeEntities) {
		try {
			yield { ...validate(unsafeEntity, ref.validator), id: unsafeEntity.id };
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			invalid = true;
			details[unsafeEntity.id] = thrown;
		}
	}
	if (invalid) throw new ValidationError(`Invalid documents for "${ref.collection}"`, new InvalidFeedback("Invalid results", details));
}

/** Observer that validates received results. */
class ValidateResultsObserver<T extends Data> extends TransformableObserver<Iterable<Entity>, Iterable<Entity<T>>> {
	protected _ref: QueryReference<T>;
	constructor(ref: QueryReference<T>, observer: Observer<Iterable<Entity<T>>>) {
		super(observer);
		this._ref = ref;
	}
	transform(unsafeResult: Iterable<Entity>): Iterable<Entity<T>> {
		return _validateResults(unsafeResult, this._ref);
	}
}
