import { ValueError } from "../../error/ValueError.js";
import { PARTIAL } from "../../schema/DataSchema.js";
import type { MutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import { getNamedMessage } from "../../util/error.js";
import type { AnyCaller } from "../../util/function.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/** Validate an asynchronous source provider (source can have any type because validation guarantees the type). */
export class ValidationDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return _validateItem(collection, await super.getItem(collection, id), this.getItem);
	}

	override async *getItemSequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
	): AsyncIterable<OptionalItem<II, TT>> {
		for await (const item of super.getItemSequence(collection, id)) yield _validateItem(collection, item, this.getItemSequence);
	}

	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		return _validateIdentifier(collection, await super.addItem(collection, collection.validate(data)), this.addItem);
	}

	override setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		return super.setItem(collection, id, collection.validate(data));
	}

	override updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		return super.updateItem(collection, id, _validateUpdates(collection, updates, this.updateItem));
	}

	override countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return super.countQuery(collection, query);
	}

	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		return _validateItems(collection, await super.getQuery(collection, query), this.getQuery);
	}

	override async *getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): AsyncIterable<Items<II, TT>> {
		for await (const items of super.getQuerySequence(collection, query)) yield _validateItems(collection, items, this.getQuerySequence);
	}

	override setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		return super.setQuery(collection, query, collection.validate(data));
	}

	override updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		return super.updateQuery(collection, query, _validateUpdates(collection, updates, this.updateQuery));
	}

	override deleteQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void> {
		return super.deleteQuery(collection, query);
	}
}

/**
 * Validate a returned `id` for a collection item.
 */
function _validateIdentifier<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	id: unknown,
	caller: AnyCaller,
): I {
	try {
		return collection.id.validate(id);
	} catch (thrown) {
		if (typeof thrown !== "string") throw thrown;
		throw new ValueError(`Invalid identifier for "${collection}"\n${thrown}`, { received: id, caller });
	}
}

/**
 * Validate an entity for a collection item.
 * @throws `ValueError` if one or more items did not validate (conflict because the program is not in an expected state).
 */
function _validateItem<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	item: Item<Identifier, Data>,
	caller: AnyCaller,
): Item<I, T>;
function _validateItem<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	item: OptionalItem<I, T> | Item<Identifier, Data> | undefined,
	caller: AnyCaller,
): OptionalItem<I, T>;
function _validateItem<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	item: OptionalItem<I, T> | Item<Identifier, Data> | undefined,
	caller: AnyCaller,
): OptionalItem<I, T> {
	if (!item) return undefined;
	try {
		return collection.item.validate(item);
	} catch (thrown) {
		if (typeof thrown !== "string") throw thrown;
		throw new ValueError(`Invalid data for "${collection}"\n${thrown}`, { received: item, caller });
	}
}

/**
 * Validate a set of entities for this query reference.
 * @throws `ValueError` if one or more items did not validate (conflict because the program is not in an expected state).
 */
function _validateItems<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	items: Items<Identifier, Data>,
	caller: AnyCaller,
): Items<I, T> {
	return Array.from(_yieldValidItems(collection, items, caller));
}
function* _yieldValidItems<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	items: Items<Identifier, Data>,
	caller: AnyCaller,
): Iterable<Item<I, T>> {
	const messages: MutableArray<string> = [];
	for (const item of items) {
		try {
			yield collection.item.validate(item);
		} catch (thrown) {
			if (typeof thrown !== "string") throw thrown;
			messages.push(getNamedMessage(item.id, thrown));
		}
	}
	if (messages.length) throw new ValueError(`Invalid data for "${collection}"\n${messages.join("\n")}`, { received: items, caller });
}

/**
 * Validate a set of updates for a collection.
 * @throws `ValueError` if the updates do not validate (conflict because the program is not in an expected state).
 *
 * @todo This currently is not correct — it's only validating the main keys of the object in a partial way
 *   We need to make a Schema validator for `Updates<T>` objects.
 *   And while we're doing it, we should make one for `Query<T>` objects too.
 */
function _validateUpdates<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	updates: Updates<Item<I, T>>,
	caller: AnyCaller,
): Updates<Item<I, T>>;
function _validateUpdates<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	updates: Updates<Item<I, T>>,
	caller: AnyCaller,
): Partial<T> {
	try {
		return PARTIAL(collection).validate(updates) as Partial<T>;
	} catch (thrown) {
		if (typeof thrown !== "string") throw thrown;
		throw new ValueError(`Invalid updates for "${collection}"\n${thrown}`, { received: updates, caller });
	}
}
