import type { Key, Datas, Data } from "../util/data.js";
import type { ItemArray, ItemValue, ItemData, ItemConstraints } from "../db/Item.js";
import type { DataSchemas, DataSchema } from "../schema/DataSchema.js";
import type { MutableObject } from "../util/object.js";
import { Updates, validateUpdates } from "../update/DataUpdate.js";
import { validate } from "../util/validate.js";
import { Feedback } from "../feedback/Feedback.js";
import { ValidationError } from "../error/ValidationError.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { Sourceable } from "../util/source.js";
import { Provider, AsyncProvider } from "./Provider.js";

/** Validate a source provider (source can have any type because validation guarantees the type). */
abstract class BaseValidationProvider<T extends Datas> {
	abstract source: Provider | AsyncProvider;
	readonly schemas: DataSchemas<T>;
	constructor(schemas: DataSchemas<T>) {
		this.schemas = schemas;
	}
	getSchema<K extends Key<T>>(collection: K): DataSchema<T[K]> {
		return this.schemas[collection];
	}
	async *getItemSequence<K extends Key<T>>(collection: K, id: string): AsyncIterable<ItemValue<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItem of this.source.getItemSequence(collection, id)) yield _validateItem(collection, unsafeItem, schema);
	}
	async *getQuerySequence<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): AsyncIterable<ItemArray<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItems of this.source.getQuerySequence(collection, constraints)) yield _validateItems(collection, unsafeItems, schema);
	}
}

/** Validate a synchronous source provider (source can have any type because validation guarantees the type). */
export class ValidationProvider<T extends Datas> extends BaseValidationProvider<T> implements Provider<T>, Sourceable<Provider> {
	readonly source: Provider;
	constructor(source: Provider, schemas: DataSchemas<T>) {
		super(schemas);
		this.source = source;
	}
	getItem<K extends Key<T>>(collection: K, id: string): ItemValue<T[K]> {
		return _validateItem(collection, this.source.getItem(collection, id), this.getSchema(collection));
	}
	addItem<K extends Key<T>>(collection: K, data: T[K]): string {
		return this.source.addItem(collection, validate(data, this.getSchema(collection)));
	}
	setItem<K extends Key<T>>(collection: K, id: string, value: T[K]): void {
		return this.source.setItem(collection, id, validate(value, this.getSchema(collection)));
	}
	updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		return this.source.updateItem(collection, id, validateUpdates(updates, this.getSchema(collection).props));
	}
	deleteItem<K extends Key<T>>(collection: K, id: string): void {
		return this.source.deleteItem(collection, id);
	}
	getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): ItemArray<T[K]> {
		return _validateItems(collection, this.source.getQuery(collection, constraints), this.getSchema(collection));
	}
	setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, value: T[K]): number {
		return this.source.setQuery(collection, constraints, validate(value, this.getSchema(collection)));
	}
	updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): number {
		return this.source.updateQuery(collection, constraints, validateUpdates(updates, this.getSchema(collection).props));
	}
	deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): number {
		return this.source.deleteQuery(collection, constraints);
	}
}

/** Validate an asynchronous source provider (source can have any type because validation guarantees the type). */
export class AsyncValidationProvider<T extends Datas> extends BaseValidationProvider<T> implements AsyncProvider<T>, Sourceable<AsyncProvider> {
	readonly source: AsyncProvider;
	constructor(source: AsyncProvider, schemas: DataSchemas<T>) {
		super(schemas);
		this.source = source;
	}
	async getItem<K extends Key<T>>(collection: K, id: string): Promise<ItemValue<T[K]>> {
		return _validateItem(collection, await this.source.getItem(collection, id), this.getSchema(collection));
	}
	addItem<K extends Key<T>>(collection: K, data: T[K]): Promise<string> {
		return this.source.addItem(collection, validate(data, this.getSchema(collection)));
	}
	setItem<K extends Key<T>>(collection: K, id: string, value: T[K]): Promise<void> {
		return this.source.setItem(collection, id, validate(value, this.getSchema(collection)));
	}
	updateItem<K extends Key<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		return this.source.updateItem(collection, id, validateUpdates(updates, this.getSchema(collection).props));
	}
	deleteItem<K extends Key<T>>(collection: K, id: string): Promise<void> {
		return this.source.deleteItem(collection, id);
	}
	async getQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<ItemArray<T[K]>> {
		return _validateItems(collection, await this.source.getQuery(collection, constraints), this.getSchema(collection));
	}
	setQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, value: T[K]): Promise<number> {
		return this.source.setQuery(collection, constraints, validate(value, this.getSchema(collection)));
	}
	updateQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>, updates: Updates<T[K]>): Promise<number> {
		return this.source.updateQuery(collection, constraints, validateUpdates(updates, this.getSchema(collection).props));
	}
	deleteQuery<K extends Key<T>>(collection: K, constraints: ItemConstraints<T[K]>): Promise<number> {
		return this.source.deleteQuery(collection, constraints);
	}
}

/** Validate an entity for a document reference. */
function _validateItem<T extends Data>(collection: string, unsafeEntity: ItemValue<Data>, schema: DataSchema<T>): ItemValue<T> {
	if (!unsafeEntity) return null;
	try {
		return { ...validate(unsafeEntity, schema), id: unsafeEntity.id };
	} catch (thrown) {
		throw thrown instanceof Feedback ? new ValidationError(`Invalid data for "${collection}"`, thrown) : thrown;
	}
}

/** Validate a set of entities for this query reference. */
function _validateItems<T extends Data>(collection: string, unsafeEntities: ItemArray<Data>, schema: DataSchema<T>): ItemArray<T> {
	return Array.from(_yieldItems(collection, unsafeEntities, schema));
}
function* _yieldItems<T extends Data>(collection: string, unsafeEntities: ItemArray<Data>, schema: DataSchema<T>): Iterable<ItemData<T>> {
	let invalid = false;
	const details: MutableObject<Feedback> = {};
	for (const unsafeEntity of unsafeEntities) {
		try {
			yield { ...validate(unsafeEntity, schema), id: unsafeEntity.id };
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			invalid = true;
			details[unsafeEntity.id] = thrown;
		}
	}
	if (invalid) throw new ValidationError(`Invalid data for "${collection}"`, new InvalidFeedback("Invalid items", details));
}
