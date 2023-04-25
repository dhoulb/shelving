import type { DataKey, Datas, Data } from "../util/data.js";
import type { ItemArray, ItemValue, ItemData, ItemStatement } from "../db/Item.js";
import type { DataSchemas, DataSchema } from "../schema/DataSchema.js";
import type { MutableDictionary } from "../util/dictionary.js";
import type { Updates } from "../update/DataUpdate.js";
import { validate, validateWithContext } from "../util/validate.js";
import { Feedback } from "../feedback/Feedback.js";
import { ValidationError } from "../error/ValidationError.js";
import { Sourceable } from "../util/source.js";
import { transformObject } from "../util/transform.js";
import { Provider, AsyncProvider } from "./Provider.js";

// Constants.
const VALIDATION_CONTEXT_GET: Data = { action: "get" };
const VALIDATION_CONTEXT_ADD: Data = { action: "add" };
const VALIDATION_CONTEXT_SET: Data = { action: "set" };
const VALIDATION_CONTEXT_UPDATE: Data = { action: "update", partial: true };

/** Validate a source provider (source can have any type because validation guarantees the type). */
abstract class BaseValidationProvider<T extends Datas> {
	abstract source: Provider | AsyncProvider;
	readonly schemas: DataSchemas<T>;
	constructor(schemas: DataSchemas<T>) {
		this.schemas = schemas;
	}
	getSchema<K extends DataKey<T>>(collection: K): DataSchema<T[K]> {
		return this.schemas[collection];
	}
	async *getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<ItemValue<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItem of this.source.getItemSequence(collection, id)) yield _validateItem(collection, unsafeItem, schema);
	}
	async *getQuerySequence<K extends DataKey<T>>(collection: K, constraints: ItemStatement<T[K]>): AsyncIterable<ItemArray<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItems of this.source.getQuerySequence(collection, constraints)) yield _validateItems(collection, unsafeItems, schema);
	}
}

/** Validate a synchronous source provider (source can have any type because validation guarantees the type). */
export class ValidationProvider<T extends Datas> extends BaseValidationProvider<T> implements Provider, Sourceable<Provider> {
	readonly source: Provider;
	constructor(source: Provider, schemas: DataSchemas<T>) {
		super(schemas);
		this.source = source;
	}
	getItem<K extends DataKey<T>>(collection: K, id: string): ItemValue<T[K]> {
		return _validateItem(collection, this.source.getItem(collection, id), this.getSchema(collection));
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		return this.source.addItem(collection, validateWithContext(data, this.getSchema(collection), VALIDATION_CONTEXT_ADD));
	}
	setItem<K extends DataKey<T>>(collection: K, id: string, value: T[K]): void {
		return this.source.setItem(collection, id, validateWithContext(value, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		return this.source.updateItem(collection, id, validateWithContext(transformObject({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE));
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		return this.source.deleteItem(collection, id);
	}
	getQuery<K extends DataKey<T>>(collection: K, constraints: ItemStatement<T[K]>): ItemArray<T[K]> {
		return _validateItems(collection, this.source.getQuery(collection, constraints), this.getSchema(collection));
	}
	setQuery<K extends DataKey<T>>(collection: K, constraints: ItemStatement<T[K]>, value: T[K]): number {
		return this.source.setQuery(collection, constraints, validate(value, this.getSchema(collection)));
	}
	updateQuery<K extends DataKey<T>>(collection: K, constraints: ItemStatement<T[K]>, updates: Updates<T[K]>): number {
		return this.source.updateQuery(collection, constraints, validateWithContext(transformObject({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE));
	}
	deleteQuery<K extends DataKey<T>>(collection: K, constraints: ItemStatement<T[K]>): number {
		return this.source.deleteQuery(collection, constraints);
	}
}

/** Validate an asynchronous source provider (source can have any type because validation guarantees the type). */
export class AsyncValidationProvider<T extends Datas> extends BaseValidationProvider<T> implements AsyncProvider, Sourceable<AsyncProvider> {
	readonly source: AsyncProvider;
	constructor(source: AsyncProvider, schemas: DataSchemas<T>) {
		super(schemas);
		this.source = source;
	}
	async getItem<K extends DataKey<T>>(collection: K, id: string): Promise<ItemValue<T[K]>> {
		return _validateItem(collection, await this.source.getItem(collection, id), this.getSchema(collection));
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		return this.source.addItem(collection, validateWithContext(data, this.getSchema(collection), VALIDATION_CONTEXT_ADD));
	}
	setItem<K extends DataKey<T>>(collection: K, id: string, value: T[K]): Promise<void> {
		return this.source.setItem(collection, id, validateWithContext(value, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		return this.source.updateItem(collection, id, validateWithContext(updates, this.getSchema(collection), VALIDATION_CONTEXT_UPDATE));
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		return this.source.deleteItem(collection, id);
	}
	async getQuery<K extends DataKey<T>>(collection: K, constraints: ItemStatement<T[K]>): Promise<ItemArray<T[K]>> {
		return _validateItems(collection, await this.source.getQuery(collection, constraints), this.getSchema(collection));
	}
	setQuery<K extends DataKey<T>>(collection: K, constraints: ItemStatement<T[K]>, value: T[K]): Promise<number> {
		return this.source.setQuery(collection, constraints, validateWithContext(value, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	updateQuery<K extends DataKey<T>>(collection: K, constraints: ItemStatement<T[K]>, updates: Updates<T[K]>): Promise<number> {
		return this.source.updateQuery(collection, constraints, validateWithContext(updates, this.getSchema(collection), VALIDATION_CONTEXT_UPDATE));
	}
	deleteQuery<K extends DataKey<T>>(collection: K, constraints: ItemStatement<T[K]>): Promise<number> {
		return this.source.deleteQuery(collection, constraints);
	}
}

/** Validate an entity for a document reference. */
function _validateItem<T extends Data>(collection: string, unsafeEntity: ItemValue<Data>, schema: DataSchema<T>): ItemValue<T> {
	if (!unsafeEntity) return null;
	try {
		return { ...validateWithContext(unsafeEntity, schema, VALIDATION_CONTEXT_GET), id: unsafeEntity.id };
	} catch (thrown) {
		if (!(thrown instanceof Feedback)) throw thrown;
		throw new ValidationError(`Invalid data for "${collection}"`, unsafeEntity);
	}
}

/** Validate a set of entities for this query reference. */
function _validateItems<T extends Data>(collection: string, unsafeEntities: ItemArray<Data>, schema: DataSchema<T>): ItemArray<T> {
	return Array.from(_yieldValidItems(collection, unsafeEntities, schema));
}
function* _yieldValidItems<T extends Data>(collection: string, unsafeEntities: ItemArray<Data>, schema: DataSchema<T>): Iterable<ItemData<T>> {
	let invalid = false;
	const details: MutableDictionary<string> = {};
	for (const unsafeEntity of unsafeEntities) {
		try {
			yield { ...validateWithContext(unsafeEntity, schema, VALIDATION_CONTEXT_GET), id: unsafeEntity.id };
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			invalid = true;
			details[unsafeEntity.id] = thrown.message;
		}
	}
	if (invalid) throw new ValidationError(`Invalid data for "${collection}"`, details);
}
