import type { AbstractProvider, AsyncProvider, Provider } from "./Provider.js";
import type { DataSchema, DatabaseSchemas } from "../schema/DataSchema.js";
import type { Data, DataKey, Database } from "../util/data.js";
import type { MutableDictionary } from "../util/dictionary.js";
import type { Item, ItemQuery, Items, OptionalItem } from "../util/item.js";
import type { Sourceable } from "../util/source.js";
import type { Updates } from "../util/update.js";
import { ValidationError } from "../error/ValidationError.js";
import { Feedback } from "../feedback/Feedback.js";
import { updateData } from "../util/update.js";
import { validateWithContext } from "../util/validate.js";

// Constants.
const VALIDATION_CONTEXT_GET = { action: "get", id: true as const };
const VALIDATION_CONTEXT_ADD = { action: "add" };
const VALIDATION_CONTEXT_SET = { action: "set" };
const VALIDATION_CONTEXT_UPDATE = { action: "update", partial: true as const };

/** Validate a source provider (source can have any type because validation guarantees the type). */
abstract class AbstractValidationProvider<T extends Database> {
	abstract source: AbstractProvider<T>;
	readonly schemas: DatabaseSchemas<T>;
	constructor(schemas: DatabaseSchemas<T>) {
		this.schemas = schemas;
	}
	getSchema<K extends DataKey<T>>(collection: K): DataSchema<T[K]> {
		return this.schemas[collection];
	}
	async *getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItem of this.source.getItemSequence(collection, id)) yield _validateItem(collection, unsafeItem, schema);
	}
	async *getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItems of this.source.getQuerySequence(collection, query)) yield _validateItems(collection, unsafeItems, schema);
	}
}

/** Validate a synchronous source provider (source can have any type because validation guarantees the type). */
export class ValidationProvider<T extends Database> extends AbstractValidationProvider<T> implements Provider<T>, Sourceable<Provider<T>> {
	readonly source: Provider<T>;
	constructor(schemas: DatabaseSchemas<T>, source: Provider<T>) {
		super(schemas);
		this.source = source;
	}
	getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]> {
		return _validateItem(collection, this.source.getItem(collection, id), this.getSchema(collection));
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
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number {
		return this.source.countQuery(collection, query);
	}
	getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]> {
		return _validateItems(collection, this.source.getQuery(collection, query), this.getSchema(collection));
	}
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, value: T[K]): void {
		return this.source.setQuery(collection, query, this.getSchema(collection).validate(value));
	}
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): void {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		return this.source.updateQuery(collection, query, updates);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void {
		return this.source.deleteQuery(collection, query);
	}
}

/** Validate an asynchronous source provider (source can have any type because validation guarantees the type). */
export class AsyncValidationProvider<T extends Database> extends AbstractValidationProvider<T> implements AsyncProvider<T>, Sourceable<AsyncProvider<T>> {
	readonly source: AsyncProvider<T>;
	constructor(schemas: DatabaseSchemas<T>, source: AsyncProvider<T>) {
		super(schemas);
		this.source = source;
	}
	async getItem<K extends DataKey<T>>(collection: K, id: string): Promise<OptionalItem<T[K]>> {
		return _validateItem(collection, await this.source.getItem(collection, id), this.getSchema(collection));
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
	countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<number> {
		return this.source.countQuery(collection, query);
	}
	async getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<Items<T[K]>> {
		return _validateItems(collection, await this.source.getQuery(collection, query), this.getSchema(collection));
	}
	setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, value: T[K]): Promise<void> {
		return this.source.setQuery(collection, query, validateWithContext(value, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): Promise<void> {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		return this.source.updateQuery(collection, query, updates);
	}
	deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<void> {
		return this.source.deleteQuery(collection, query);
	}
}

/** Validate an entity for a document reference. */
function _validateItem<T extends Data>(collection: string, unsafeEntity: Item<Data>, schema: DataSchema<T>): Item<T>;
function _validateItem<T extends Data>(collection: string, unsafeEntity: OptionalItem<Data>, schema: DataSchema<T>): OptionalItem<T>;
function _validateItem<T extends Data>(collection: string, unsafeEntity: OptionalItem<Data>, schema: DataSchema<T>): OptionalItem<T> {
	if (!unsafeEntity) return undefined;
	try {
		return validateWithContext<T>(unsafeEntity, schema, VALIDATION_CONTEXT_GET);
	} catch (thrown) {
		if (!(thrown instanceof Feedback)) throw thrown;
		throw new ValidationError(`Invalid data for "${collection}"`, thrown.message);
	}
}

/** Validate a set of entities for this query reference. */
function _validateItems<T extends Data>(collection: string, unsafeEntities: Items<Data>, schema: DataSchema<T>): Items<T> {
	return Array.from(_yieldValidItems(collection, unsafeEntities, schema));
}
function* _yieldValidItems<T extends Data>(collection: string, unsafeEntities: Items<Data>, schema: DataSchema<T>): Iterable<Item<T>> {
	let invalid = false;
	const messages: MutableDictionary<string> = {};
	for (const unsafeEntity of unsafeEntities) {
		try {
			yield validateWithContext(unsafeEntity, schema, VALIDATION_CONTEXT_GET);
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			invalid = true;
			messages[unsafeEntity.id] = thrown.message;
		}
	}
	if (invalid) throw new ValidationError(`Invalid data for "${collection}"`, messages);
}
