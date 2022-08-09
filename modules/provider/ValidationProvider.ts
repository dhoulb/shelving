import type { OptionalData, Entity, OptionalEntity, Entities, Key, Datas, Data } from "../util/data.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { MutableObject } from "../util/object.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Unsubscribe } from "../observe/Observable.js";
import { validate, Validator, Validators } from "../util/validate.js";
import { Feedback } from "../feedback/Feedback.js";
import { ValidationError } from "../error/ValidationError.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { TransformableObserver } from "../observe/TransformableObserver.js";
import { AbstractProvider, Provider, AsyncProvider, ProviderCollection, ProviderDocument, ProviderQuery } from "./Provider.js";
import type { ThroughProvider, AsyncThroughProvider } from "./ThroughProvider.js";

/** Validate a source provider. */
export abstract class AbstractValidationProvider<T extends Datas> extends AbstractProvider<T> {
	abstract readonly source: AbstractProvider<T>;
	readonly validators: Validators<T>;
	constructor(validators: Validators<T>) {
		super();
		this.validators = validators;
	}
	getValidator<K extends Key<T>>({ collection }: ProviderCollection<T, K>): Validator<T[K]> {
		return this.validators[collection];
	}
	subscribeDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, observer: PartialObserver<OptionalData>): Unsubscribe {
		return this.source.subscribeDocument(ref, new _ValidateEntityObserver(ref, this.getValidator(ref), observer));
	}
	subscribeQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, observer: PartialObserver<Entities<T[K]>>): Unsubscribe {
		return this.source.subscribeQuery(ref, new _ValidateEntitiesObserver(ref, this.getValidator(ref), observer));
	}
}

/** Validate a synchronous source provider. */
export class ValidationProvider<T extends Datas> extends AbstractValidationProvider<T> implements ThroughProvider<T> {
	readonly source: Provider<T>;
	constructor(source: Provider<T>, validators: Validators<T>) {
		super(validators);
		this.source = source;
	}
	getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): OptionalEntity<T[K]> {
		return _validateEntity(this.source.getDocument(ref), ref, this.getValidator(ref));
	}
	addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): string {
		return this.source.addDocument(ref, validate(data, this.getValidator(ref)));
	}
	setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, value: T[K]): void {
		return this.source.setDocument(ref, validate(value, this.getValidator(ref)));
	}
	updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): void {
		return this.source.updateDocument(ref, update.validate(this.getValidator(ref)));
	}
	deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): void {
		return this.source.deleteDocument(ref);
	}
	getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Entities<T[K]> {
		return _validateEntities(this.source.getQuery(ref), ref, this.getValidator(ref));
	}
	setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, value: T[K]): number {
		return this.source.setQuery(ref, validate(value, this.getValidator(ref)));
	}
	updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): number {
		return this.source.updateQuery(ref, update.validate(this.getValidator(ref)));
	}
	deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): number {
		return this.source.deleteQuery(ref);
	}
}

/** Validate an asynchronous source provider. */
export class AsyncValidationProvider<T extends Datas> extends AbstractValidationProvider<T> implements AsyncThroughProvider<T> {
	readonly source: AsyncProvider<T>;
	constructor(source: AsyncProvider<T>, validators: Validators<T>) {
		super(validators);
		this.source = source;
	}
	async getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<OptionalEntity<T[K]>> {
		return _validateEntity(await this.source.getDocument(ref), ref, this.getValidator(ref));
	}
	addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): Promise<string> {
		return this.source.addDocument(ref, validate(data, this.getValidator(ref)));
	}
	setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, value: T[K]): Promise<void> {
		return this.source.setDocument(ref, validate(value, this.getValidator(ref)));
	}
	updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): Promise<void> {
		return this.source.updateDocument(ref, update.validate(this.getValidator(ref)));
	}
	deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<void> {
		return this.source.deleteDocument(ref);
	}
	async getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<Entities<T[K]>> {
		return _validateEntities(await this.source.getQuery(ref), ref, this.getValidator(ref));
	}
	setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, value: T[K]): Promise<number> {
		return this.source.setQuery(ref, validate(value, this.getValidator(ref)));
	}
	updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): Promise<number> {
		return this.source.updateQuery(ref, update.validate(this.getValidator(ref)));
	}
	deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<number> {
		return this.source.deleteQuery(ref);
	}
}

/** Validate an entity for a document reference. */
function _validateEntity<T extends Datas, K extends Key<T>>(unsafeEntity: OptionalEntity<Data>, ref: ProviderCollection<T, K>, validator: Validator<T[K]>): OptionalEntity<T[K]> {
	if (!unsafeEntity) return null;
	try {
		return { ...validate(unsafeEntity, validator), id: unsafeEntity.id };
	} catch (thrown) {
		throw thrown instanceof Feedback ? new ValidationError(`Invalid data for "${ref}"`, thrown) : thrown;
	}
}

/** Observer that validates received entities. */
class _ValidateEntityObserver<T extends Datas, K extends Key<T>> extends TransformableObserver<OptionalEntity<Data>, OptionalEntity<T[K]>> {
	protected _ref: ProviderCollection<T, K>;
	protected _validator: Validator<T[K]>;
	constructor(ref: ProviderCollection<T, K>, validator: Validator<T[K]>, observer: PartialObserver<OptionalEntity<T[K]>>) {
		super(observer);
		this._ref = ref;
		this._validator = validator;
	}
	transform(unsafeEntity: OptionalEntity<Data>): OptionalEntity<T[K]> {
		return _validateEntity(unsafeEntity, this._ref, this._validator);
	}
}

/** Validate a set of entities for this query reference. */
function _validateEntities<T extends Datas, K extends Key<T>>(unsafeEntities: Entities<Data>, ref: ProviderCollection<T, K>, validator: Validator<T[K]>): Entities<T[K]> {
	return Array.from(_yieldEntities(unsafeEntities, ref, validator));
}
function* _yieldEntities<T extends Datas, K extends Key<T>>(unsafeEntities: Entities<Data>, ref: ProviderCollection<T, K>, validator: Validator<T[K]>): Iterable<Entity<T[K]>> {
	let invalid = false;
	const details: MutableObject<Feedback> = {};
	for (const unsafeEntity of unsafeEntities) {
		try {
			yield { ...validate(unsafeEntity, validator), id: unsafeEntity.id };
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			invalid = true;
			details[unsafeEntity.id] = thrown;
		}
	}
	if (invalid) throw new ValidationError(`Invalid data for "${ref.collection}"`, new InvalidFeedback("Invalid documents", details));
}

/** Observer that validates received entities. */
class _ValidateEntitiesObserver<T extends Datas, K extends Key<T>> extends TransformableObserver<Entities<Data>, Entities<T[K]>> {
	protected _ref: ProviderCollection<T, K>;
	protected _validator: Validator<T[K]>;
	constructor(ref: ProviderCollection<T, K>, validator: Validator<T[K]>, observer: PartialObserver<Entities<T[K]>>) {
		super(observer);
		this._ref = ref;
		this._validator = validator;
	}
	transform(unsafeEntities: Entities<Data>): Entities<T[K]> {
		return _validateEntities(unsafeEntities, this._ref, this._validator);
	}
}
