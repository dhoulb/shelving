import { ValueError } from "../error/ValueError.js";
import { Feedback } from "../feedback/Feedback.js";
import { type DataSchema, type DataSchemas, PARTIAL } from "../schema/DataSchema.js";
import type { Schema } from "../schema/Schema.js";
import type { MutableArray } from "../util/array.js";
import type { Data, Database, DataKey } from "../util/data.js";
import { getNamedMessage } from "../util/error.js";
import type { AnyFunction } from "../util/function.js";
import type { Identifier, Item, Items, OptionalItem } from "../util/item.js";
import type { ItemQuery } from "../util/query.js";
import type { Sourceable } from "../util/source.js";
import type { Updates } from "../util/update.js";
import { type Validators, validateData } from "../util/validate.js";
import type { AsyncProvider, Provider } from "./Provider.js";
import { AsyncThroughProvider, ThroughProvider } from "./ThroughProvider.js";

/** Validate a synchronous source provider (source can have any type because validation guarantees the type). */
export class ValidationProvider<I extends Identifier, T extends Database>
	extends ThroughProvider<I, T>
	implements Provider<I, T>, Sourceable<Provider<I, T>>
{
	readonly identifier: Schema<I>;
	readonly schemas: DataSchemas<T>;
	constructor(id: Schema<I>, schemas: DataSchemas<T>, source: Provider<I, T>) {
		super(source);
		this.identifier = id;
		this.schemas = schemas;
	}
	/** Get a named schema. */
	getSchema<K extends DataKey<T>>(collection: K): DataSchema<T[K]> {
		return this.schemas[collection];
	}
	override getItem<K extends DataKey<T>>(collection: K, id: I): OptionalItem<I, T[K]> {
		return _validateItem(collection, super.getItem(collection, id), this.identifier, this.getSchema(collection), this.getItem);
	}
	override async *getItemSequence<K extends DataKey<T>>(collection: K, id: I): AsyncIterable<OptionalItem<I, T[K]>> {
		const schema = this.getSchema(collection);
		for await (const item of super.getItemSequence(collection, id))
			yield _validateItem(collection, item, this.identifier, schema, this.getItemSequence);
	}
	override addItem<K extends DataKey<T>>(collection: K, data: T[K]): I {
		return super.addItem(collection, validateData(data, this.getSchema(collection).props));
	}
	override setItem<K extends DataKey<T>>(collection: K, id: I, data: T[K]): void {
		super.setItem(collection, id, validateData(data, this.getSchema(collection).props));
	}
	override updateItem<K extends DataKey<T>>(collection: K, id: I, updates: Updates<T[K]>): void {
		super.updateItem(collection, id, _validateUpdates(collection, updates, this.getSchema(collection), this.updateItem));
	}
	override deleteItem<K extends DataKey<T>>(collection: K, id: I): void {
		super.deleteItem(collection, id);
	}
	override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): number {
		return super.countQuery(collection, query);
	}
	override getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Items<I, T[K]> {
		return _validateItems(collection, super.getQuery(collection, query), this.identifier, this.getSchema(collection), this.getQuery);
	}
	override setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, data: T[K]): void {
		super.setQuery(collection, query, this.getSchema(collection).validate(data));
	}
	override updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, updates: Updates<T[K]>): void {
		super.updateQuery(collection, query, _validateUpdates(collection, updates, this.getSchema(collection), this.updateQuery));
	}
	override deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): void {
		super.deleteQuery(collection, query);
	}
	override async *getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): AsyncIterable<Items<I, T[K]>> {
		const schema = this.getSchema(collection);
		for await (const items of super.getQuerySequence(collection, query))
			yield _validateItems(collection, items, this.identifier, schema, this.getQuerySequence);
	}
}

/** Validate an asynchronous source provider (source can have any type because validation guarantees the type). */
export class AsyncValidationProvider<I extends Identifier, T extends Database>
	extends AsyncThroughProvider<I, T>
	implements AsyncProvider<I, T>, Sourceable<AsyncProvider<I, T>>
{
	readonly identifier: Schema<I>;
	readonly schemas: DataSchemas<T>;
	constructor(id: Schema<I>, schemas: DataSchemas<T>, source: AsyncProvider<I, T>) {
		super(source);
		this.identifier = id;
		this.schemas = schemas;
	}

	/** Get a named data schema for this database. */
	getSchema<K extends DataKey<T>>(collection: K): DataSchema<T[K]> {
		return this.schemas[collection];
	}

	override async getItem<K extends DataKey<T>>(collection: K, id: I): Promise<OptionalItem<I, T[K]>> {
		return _validateItem(collection, await super.getItem(collection, id), this.identifier, this.getSchema(collection), this.getItem);
	}
	override async *getItemSequence<K extends DataKey<T>>(collection: K, id: I): AsyncIterable<OptionalItem<I, T[K]>> {
		const schema = this.getSchema(collection);
		for await (const item of super.getItemSequence(collection, id))
			yield _validateItem(collection, item, this.identifier, schema, this.getItemSequence);
	}
	override addItem<K extends DataKey<T>>(collection: K, data: T[K]): Promise<I> {
		return super.addItem(collection, validateData(data, this.getSchema(collection).props));
	}
	override setItem<K extends DataKey<T>>(collection: K, id: I, data: T[K]): Promise<void> {
		return super.setItem(collection, id, validateData(data, this.getSchema(collection).props));
	}
	override updateItem<K extends DataKey<T>>(collection: K, id: I, updates: Updates<T[K]>): Promise<void> {
		return super.updateItem(collection, id, _validateUpdates(collection, updates, this.getSchema(collection), this.updateItem));
	}
	override deleteItem<K extends DataKey<T>>(collection: K, id: I): Promise<void> {
		return super.deleteItem(collection, id);
	}
	override countQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Promise<number> {
		return super.countQuery(collection, query);
	}
	override async getQuery<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): Promise<Items<I, T[K]>> {
		return _validateItems(collection, await super.getQuery(collection, query), this.identifier, this.getSchema(collection), this.getQuery);
	}
	override async *getQuerySequence<K extends DataKey<T>>(collection: K, query?: ItemQuery<I, T[K]>): AsyncIterable<Items<I, T[K]>> {
		const schema = this.getSchema(collection);
		for await (const items of super.getQuerySequence(collection, query))
			yield _validateItems(collection, items, this.identifier, schema, this.getQuerySequence);
	}
	override setQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, data: T[K]): Promise<void> {
		return super.setQuery(collection, query, validateData(data, this.getSchema(collection).props));
	}
	override updateQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>, updates: Updates<T[K]>): Promise<void> {
		return super.updateQuery(collection, query, _validateUpdates(collection, updates, this.getSchema(collection), this.updateQuery));
	}
	override deleteQuery<K extends DataKey<T>>(collection: K, query: ItemQuery<I, T[K]>): Promise<void> {
		return super.deleteQuery(collection, query);
	}
}

/**
 * Validate an entity for a document reference.
 * @throws `ValueError` if one or more items did not validate (conflict because the program is not in an expected state).
 */
function _validateItem<I extends Identifier, T extends Data>(
	collection: string, //
	item: Item<Identifier, Data>,
	identifier: Schema<I>,
	schema: DataSchema<T>,
	caller: AnyFunction,
): Item<I, T>;
function _validateItem<I extends Identifier, T extends Data>(
	collection: string,
	item: OptionalItem<Identifier, Data>,
	identifier: Schema<I>,
	schema: DataSchema<T>,
	caller: AnyFunction,
): OptionalItem<I, T>;
function _validateItem<I extends Identifier, T extends Data>(
	collection: string,
	item: OptionalItem<Identifier, Data>,
	identifier: Schema<I>,
	schema: DataSchema<T>,
	caller: AnyFunction,
): OptionalItem<I, T> {
	if (!item) return undefined;
	try {
		return validateData<Item<I, T>>(item, { id: identifier, ...schema.props } as Validators<Item<I, T>>);
	} catch (thrown) {
		if (!(thrown instanceof Feedback)) throw thrown;
		throw new ValueError(`Invalid data for "${collection}"\n${thrown.message}`, { item, caller });
	}
}

/**
 * Validate a set of entities for this query reference.
 * @throws `ValueError` if one or more items did not validate (conflict because the program is not in an expected state).
 */
function _validateItems<I extends Identifier, T extends Data>(
	collection: string,
	items: Items<Identifier, Data>,
	identifier: Schema<I>,
	schema: DataSchema<T>,
	caller: AnyFunction,
): Items<I, T> {
	return Array.from(_yieldValidItems(collection, items, { id: identifier, ...schema.props } as Validators<Item<I, T>>, caller));
}
function* _yieldValidItems<I extends Identifier, T extends Data>(
	collection: string,
	items: Items<Identifier, Data>,
	validators: Validators<Item<I, T>>,
	caller: AnyFunction,
): Iterable<Item<I, T>> {
	const messages: MutableArray<string> = [];
	for (const item of items) {
		try {
			yield validateData(item, validators);
		} catch (thrown) {
			if (!(thrown instanceof Feedback)) throw thrown;
			messages.push(getNamedMessage(item.id, thrown.message));
		}
	}
	if (messages.length) throw new ValueError(`Invalid data for "${collection}"\n${messages.join("\n")}`, { items, caller });
}

/** Validate a set of updates for a collection. */
function _validateUpdates<T extends Data>(collection: string, updates: Updates<T>, schema: DataSchema<T>, caller: AnyFunction): Updates<T>;
function _validateUpdates<T extends Data>(collection: string, updates: Updates<T>, schema: DataSchema<T>, caller: AnyFunction): Partial<T> {
	try {
		return validateData<Partial<T>>(updates, PARTIAL(schema).props);
	} catch (thrown) {
		if (!(thrown instanceof Feedback)) throw thrown;
		throw new ValueError(`Invalid updates for "${collection}"\n${thrown.message}`, { updates, caller });
	}
}
