import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { Data, OptionalData, Entity, OptionalEntity, Entities } from "../util/data.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { MutableObject } from "../util/object.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Unsubscribe } from "../observe/Observable.js";
import { callAsync } from "../util/async.js";
import { validate } from "../util/validate.js";
import { validateUpdate } from "../update/util.js";
import { Feedback } from "../feedback/Feedback.js";
import { ValidationError } from "../error/ValidationError.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { TransformableObserver } from "../observe/TransformableObserver.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Validates any values that are read from or written to a source provider. */
export class ValidationProvider extends ThroughProvider {
	override getDocument<T extends Data>(ref: DocumentReference<T>): OptionalEntity<T> | PromiseLike<OptionalEntity<T>> {
		return callAsync(_validateEntity, super.getDocument(ref), ref);
	}
	override subscribeDocument<T extends Data>(ref: DocumentReference<T>, observer: PartialObserver<OptionalData>): Unsubscribe {
		return super.subscribeDocument(ref, new ValidateEntityObserver(ref, observer));
	}
	override addDocument<T extends Data>(ref: QueryReference<T>, data: T): string | PromiseLike<string> {
		return super.addDocument(ref, validate(data, ref.validator));
	}
	override setDocument<T extends Data>(ref: DocumentReference<T>, value: T): void | PromiseLike<void> {
		return super.setDocument(ref, validate(value, ref.validator));
	}
	override updateDocument<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): void | PromiseLike<void> {
		return super.updateDocument<T>(ref, validateUpdate(update, ref.validator));
	}
	override getQuery<T extends Data>(ref: QueryReference<T>): Entities<T> | PromiseLike<Entities<T>> {
		return callAsync(_validateEntities, super.getQuery(ref), ref);
	}
	override subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: PartialObserver<Entities<T>>): Unsubscribe {
		return super.subscribeQuery(ref, new ValidateEntitiesObserver(ref, observer));
	}
	override setQuery<T extends Data>(ref: QueryReference<T>, value: T): number | PromiseLike<number> {
		return super.setQuery(ref, validate(value, ref.validator));
	}
	override updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): number | PromiseLike<number> {
		return super.updateQuery(ref, validateUpdate(update, ref.validator));
	}
}

/** Validate an entity for a document reference. */
function _validateEntity<T extends Data>(unsafeEntity: OptionalEntity, ref: DocumentReference<T>): OptionalEntity<T> {
	if (!unsafeEntity) return null;
	try {
		return { ...validate(unsafeEntity, ref.validator), id: unsafeEntity.id };
	} catch (thrown) {
		throw thrown instanceof Feedback ? new ValidationError(`Invalid data for ${ref.toString()}`, thrown) : thrown;
	}
}

/** Observer that validates received entities. */
class ValidateEntityObserver<T extends Data> extends TransformableObserver<OptionalEntity, OptionalEntity<T>> {
	protected _ref: DocumentReference<T>;
	constructor(ref: DocumentReference<T>, observer: PartialObserver<OptionalEntity<T>>) {
		super(observer);
		this._ref = ref;
	}
	transform(unsafeEntity: OptionalEntity): OptionalEntity<T> {
		return _validateEntity(unsafeEntity, this._ref);
	}
}

/** Validate a set of entities for this query reference. */
function _validateEntities<T extends Data>(unsafeEntities: Entities, ref: QueryReference<T>): Entities<T> {
	return Array.from(_yieldEntities(unsafeEntities, ref));
}
function* _yieldEntities<T extends Data>(unsafeEntities: Entities, ref: QueryReference<T>): Iterable<Entity<T>> {
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
	if (invalid) throw new ValidationError(`Invalid documents for "${ref.collection}"`, new InvalidFeedback("Invalid entities", details));
}

/** Observer that validates received entities. */
class ValidateEntitiesObserver<T extends Data> extends TransformableObserver<Entities, Entities<T>> {
	protected _ref: QueryReference<T>;
	constructor(ref: QueryReference<T>, observer: PartialObserver<Entities<T>>) {
		super(observer);
		this._ref = ref;
	}
	transform(unsafeEntities: Entities): Entities<T> {
		return _validateEntities(unsafeEntities, this._ref);
	}
}
