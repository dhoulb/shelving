import { ValueError } from "../../error/ValueError.js";
import { type DataSchema, PARTIAL } from "../../schema/DataSchema.js";
import type { Schema } from "../../schema/Schema.js";
import type { MutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import { getNamedMessage } from "../../util/error.js";
import type { AnyFunction } from "../../util/function.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import type { ItemQuery } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import { type Validators, validateData } from "../../util/validate.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/** Validate an asynchronous source provider (source can have any type because validation guarantees the type). */
export class ValidationDBProvider<I extends Identifier = Identifier> extends ThroughDBProvider<I> {
	override async getItem<T extends Data>(collection: Collection<string, I, T>, id: I): Promise<OptionalItem<I, T>> {
		return _validateItem(collection.name, await super.getItem(collection, id), collection.id, collection, this.getItem);
	}

	override async *getItemSequence<T extends Data>(collection: Collection<string, I, T>, id: I): AsyncIterable<OptionalItem<I, T>> {
		for await (const item of super.getItemSequence(collection, id))
			yield _validateItem(collection.name, item, collection.id, collection, this.getItemSequence);
	}

	override addItem<T extends Data>(collection: Collection<string, I, T>, data: T): Promise<I> {
		return super.addItem(collection, validateData(data, collection.props));
	}

	override setItem<T extends Data>(collection: Collection<string, I, T>, id: I, data: T): Promise<void> {
		return super.setItem(collection, id, validateData(data, collection.props));
	}

	override updateItem<T extends Data>(collection: Collection<string, I, T>, id: I, updates: Updates<T>): Promise<void> {
		return super.updateItem(collection, id, _validateUpdates(collection.name, updates, collection, this.updateItem));
	}

	override countQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<number> {
		return super.countQuery(collection, query);
	}

	override async getQuery<T extends Data>(collection: Collection<string, I, T>, query?: ItemQuery<I, T>): Promise<Items<I, T>> {
		return _validateItems(collection.name, await super.getQuery(collection, query), collection.id, collection, this.getQuery);
	}

	override async *getQuerySequence<T extends Data>(
		collection: Collection<string, I, T>,
		query?: ItemQuery<I, T>,
	): AsyncIterable<Items<I, T>> {
		for await (const items of super.getQuerySequence(collection, query))
			yield _validateItems(collection.name, items, collection.id, collection, this.getQuerySequence);
	}

	override setQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, data: T): Promise<void> {
		return super.setQuery(collection, query, collection.validate(data));
	}

	override updateQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>, updates: Updates<T>): Promise<void> {
		return super.updateQuery(collection, query, _validateUpdates(collection.name, updates, collection, this.updateQuery));
	}

	override deleteQuery<T extends Data>(collection: Collection<string, I, T>, query: ItemQuery<I, T>): Promise<void> {
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
		if (typeof thrown !== "string") throw thrown;
		throw new ValueError(`Invalid data for "${collection}"\n${thrown}`, { item, caller });
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
			if (typeof thrown !== "string") throw thrown;
			messages.push(getNamedMessage(item.id, thrown));
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
		if (typeof thrown !== "string") throw thrown;
		throw new ValueError(`Invalid updates for "${collection}"\n${thrown}`, { updates, caller });
	}
}
