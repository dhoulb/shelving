import { ValueError } from "../error/ValueError.js";
import { Feedback } from "../feedback/Feedback.js";
import type { DataSchema, DatabaseSchemas } from "../schema/DataSchema.js";
import type { Data, DataKey, Database } from "../util/data.js";
import type { MutableDictionary } from "../util/dictionary.js";
import type { Item, ItemQuery, Items, OptionalItem } from "../util/item.js";
import type { Sourceable } from "../util/source.js";
import type { Updates } from "../util/update.js";
import { updateData } from "../util/update.js";
import { validateWithContext } from "../util/validate.js";
import type { AsyncProvider, Provider } from "./Provider.js";
import { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";

// Constants.
const VALIDATION_CONTEXT_GET = { action: "get", id: true as const };
const VALIDATION_CONTEXT_ADD = { action: "add" };
const VALIDATION_CONTEXT_SET = { action: "set" };
const VALIDATION_CONTEXT_UPDATE = { action: "update", partial: true as const };

/** Validate a synchronous source provider (source can have any type because validation guarantees the type). */
export class ValidationProvider<T extends Database> extends ThroughProvider<T> implements Provider<T>, Sourceable<Provider<T>> {
	readonly schemas: DatabaseSchemas<T>;
	constructor(schemas: DatabaseSchemas<T>, source: Provider<T>) {
		super(source);
		this.schemas = schemas;
	}
	/** Get a named schema. */
	getSchema<K extends DataKey<T>>(collection: K): DataSchema<T[K]> {
		return this.schemas[collection];
	}
	override getItem<K extends DataKey<T>>(collection: K, id: string): OptionalItem<T[K]> {
		return _validateItem(collection, super.getItem(collection, id), this.getSchema(collection));
	}
	override async *getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItem of super.getItemSequence(collection, id)) yield _validateItem(collection, unsafeItem, schema);
	}
	override addItem<K extends DataKey<T>>(collection: K, data: T[K]): string {
		return super.addItem(collection, validateWithContext(data, this.getSchema(collection), VALIDATION_CONTEXT_ADD));
	}
	override setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): void {
		super.setItem(collection, id, validateWithContext(data, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	override updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): void {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		super.updateItem(collection, id, updates);
	}
	override deleteItem<K extends DataKey<T>>(collection: K, id: string): void {
		super.deleteItem(collection, id);
	}
	override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): number {
		return super.countQuery(collection, query);
	}
	override getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Items<T[K]> {
		return _validateItems(collection, super.getQuery(collection, query), this.getSchema(collection));
	}
	override setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): void {
		super.setQuery(collection, query, this.getSchema(collection).validate(data));
	}
	override updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): void {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		super.updateQuery(collection, query, updates);
	}
	override deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): void {
		super.deleteQuery(collection, query);
	}
	override async *getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItems of super.getQuerySequence(collection, query)) yield _validateItems(collection, unsafeItems, schema);
	}
}

/** Validate an asynchronous source provider (source can have any type because validation guarantees the type). */
export class AsyncValidationProvider<T extends Database>
	extends AsyncThroughProvider<T>
	implements AsyncProvider<T>, Sourceable<AsyncProvider<T>>
{
	readonly schemas: DatabaseSchemas<T>;
	constructor(schemas: DatabaseSchemas<T>, source: AsyncProvider<T>) {
		super(source);
		this.schemas = schemas;
	}
	getSchema<K extends DataKey<T>>(collection: K): DataSchema<T[K]> {
		return this.schemas[collection];
	}
	override async getItem<K extends DataKey<T>>(collection: K, id: string): Promise<OptionalItem<T[K]>> {
		return _validateItem(collection, await super.getItem(collection, id), this.getSchema(collection));
	}
	override async *getItemSequence<K extends DataKey<T>>(collection: K, id: string): AsyncIterable<OptionalItem<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItem of super.getItemSequence(collection, id)) yield _validateItem(collection, unsafeItem, schema);
	}
	override addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<string> {
		return super.addItem(collection, validateWithContext(data, this.getSchema(collection), VALIDATION_CONTEXT_ADD));
	}
	override setItem<K extends DataKey<T>>(collection: K, id: string, data: T[K]): Promise<void> {
		return super.setItem(collection, id, validateWithContext(data, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	override updateItem<K extends DataKey<T>>(collection: K, id: string, updates: Updates<T[K]>): Promise<void> {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		return super.updateItem(collection, id, updates);
	}
	override deleteItem<K extends DataKey<T>>(collection: K, id: string): Promise<void> {
		return super.deleteItem(collection, id);
	}
	override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<number> {
		return super.countQuery(collection, query);
	}
	override async getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): Promise<Items<T[K]>> {
		return _validateItems(collection, await super.getQuery(collection, query), this.getSchema(collection));
	}
	override async *getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<T[K]>): AsyncIterable<Items<T[K]>> {
		const schema = this.getSchema(collection);
		for await (const unsafeItems of super.getQuerySequence(collection, query)) yield _validateItems(collection, unsafeItems, schema);
	}
	override setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, data: T[K]): Promise<void> {
		return super.setQuery(collection, query, validateWithContext(data, this.getSchema(collection), VALIDATION_CONTEXT_SET));
	}
	override updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>, updates: Updates<T[K]>): Promise<void> {
		validateWithContext(updateData<Data>({}, updates), this.getSchema(collection), VALIDATION_CONTEXT_UPDATE);
		return super.updateQuery(collection, query, updates);
	}
	override deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<T[K]>): Promise<void> {
		return super.deleteQuery(collection, query);
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
		throw new ValueError(`Invalid data for "${collection}"`, thrown.message);
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
	if (invalid) throw new ValueError(`Invalid data for "${collection}"`, messages);
}
