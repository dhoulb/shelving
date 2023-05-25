import type { AsyncProvider, Provider } from "./Provider.js";
import type { ItemArray, ItemData, ItemQuery, ItemValue } from "../db/ItemReference.js";
import type { DataSchema, DataSchemas } from "../schema/DataSchema.js";
import type { Data, DataKey, Datas } from "../util/data.js";
import type { MutableDictionary } from "../util/dictionary.js";
import type { Sourceable } from "../util/source.js";
import type { Updates } from "../util/update.js";
import { ValidationError } from "../error/ValidationError.js";
import { Feedback } from "../feedback/Feedback.js";
import { updateData } from "../util/update.js";
import { validateWithContext } from "../util/validate.js";

// Constants.
const VALIDATION_CONTEXT_GET: Data = { action: "get", id: true };
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
		for await (const unsafeItem of this.source.getItemSequence(collection, id)) yield _validateItemValue(collection, unsafeItem, schema);
	}
	async *getQuerySequence<K extends DataKey<T>>(collection: K, constraints: ItemQuery<T[K]>): AsyncIterable<ItemArray<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItems of this.source.getQuerySequence(collection, constraints)) yield _validateItemArray(collection, unsafeItems, schema);
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
		return _validateItemValue(collection, this.source.getItem(collection, id), this.getSchema(collection));
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		return this.source.addItem(collection, validateWithContext(data, this.getSchema(collection), VALIDATION_CONTEXT_ADD));
	}
	setItem<K extends DataKey<T>>(collection: K, id: string, value: T[K]): void {
		return this.source.setItem(collection, id, validateWithContext(value, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		return this.source.updateItem(collection, id, updates);
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		return this.source.deleteItem(collection, id);
	}
	getQuery<K extends DataKey<T>>(collection: K, constraints: ItemQuery<T[K]>): ItemArray<T[K]> {
		return _validateItemArray(collection, this.source.getQuery(collection, constraints), this.getSchema(collection));
	}
	setQuery<K extends DataKey<T>>(collection: K, constraints: ItemQuery<T[K]>, value: T[K]): number {
		return this.source.setQuery(collection, constraints, this.getSchema(collection).validate(value));
	}
	updateQuery<K extends DataKey<T>>(collection: K, constraints: ItemQuery<T[K]>, updates: Updates<T[K]>): number {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		return this.source.updateQuery(collection, constraints, updates);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, constraints: ItemQuery<T[K]>): number {
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
		return _validateItemValue(collection, await this.source.getItem(collection, id), this.getSchema(collection));
	}
	addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		return this.source.addItem(collection, validateWithContext(data, this.getSchema(collection), VALIDATION_CONTEXT_ADD));
	}
	setItem<K extends DataKey<T>>(collection: K, id: string, value: T[K]): Promise<void> {
		return this.source.setItem(collection, id, validateWithContext(value, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		return this.source.updateItem(collection, id, updates);
	}
	deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		return this.source.deleteItem(collection, id);
	}
	async getQuery<K extends DataKey<T>>(collection: K, constraints: ItemQuery<T[K]>): Promise<ItemArray<T[K]>> {
		return _validateItemArray(collection, await this.source.getQuery(collection, constraints), this.getSchema(collection));
	}
	setQuery<K extends DataKey<T>>(collection: K, constraints: ItemQuery<T[K]>, value: T[K]): Promise<number> {
		return this.source.setQuery(collection, constraints, validateWithContext(value, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	updateQuery<K extends DataKey<T>>(collection: K, constraints: ItemQuery<T[K]>, updates: Updates<T[K]>): Promise<number> {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		return this.source.updateQuery(collection, constraints, updates);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, constraints: ItemQuery<T[K]>): Promise<number> {
		return this.source.deleteQuery(collection, constraints);
	}
}

/** Validate an entity for a document reference. */
function _validateItemValue<T extends Data>(collection: string, unsafeEntity: ItemValue<Data>, schema: DataSchema<T>): ItemValue<T> {
	if (!unsafeEntity) return undefined;
	try {
		return validateWithContext(unsafeEntity, schema, VALIDATION_CONTEXT_GET) as ItemData<T>;
	} catch (thrown) {
		if (!(thrown instanceof Feedback)) throw thrown;
		throw new ValidationError(`Invalid data for "${collection}"`, thrown.message);
	}
}

/** Validate a set of entities for this query reference. */
function _validateItemArray<T extends Data>(collection: string, unsafeEntities: ItemArray<Data>, schema: DataSchema<T>): ItemArray<T> {
	return Array.from(_validateItems(collection, unsafeEntities, schema));
}
function* _validateItems<T extends Data>(collection: string, unsafeEntities: ItemArray<Data>, schema: DataSchema<T>): Iterable<ItemData<T>> {
	let invalid = false;
	const messages: MutableDictionary<string> = {};
	for (const unsafeEntity of unsafeEntities) {
		try {
			yield validateWithContext(unsafeEntity, schema, VALIDATION_CONTEXT_GET) as ItemData<T>;
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			invalid = true;
			messages[unsafeEntity.id] = thrown.message;
		}
	}
	if (invalid) throw new ValidationError(`Invalid data for "${collection}"`, messages);
}
