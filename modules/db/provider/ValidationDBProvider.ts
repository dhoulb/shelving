import { ValueError } from "../../error/ValueError.js";
import type { MutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import { getNamedMessage } from "../../util/error.js";
import type { AnyCaller } from "../../util/function.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/**
 * Database provider that validates data flowing to and from an asynchronous source provider.
 *
 * - Wraps a `source` provider (which may have any type, because validation guarantees the type) and runs every value through the relevant `Collection` schema before writing and after reading.
 * - Written data is validated against the collection's data schema; read data is validated against the item schema, so trusted, correctly-typed values reach the rest of the app.
 * - Updates are validated with `Collection.updates`, and every query with `Collection.query`, so an unknown key or a bad value never reaches the source.
 * - Validation failures here are program-state errors, so they throw a typed `ValueError` rather than a raw validation `string`.
 * - Applies inside `transact()` too — the transaction provider the callback receives validates its reads and writes the same way.
 *
 * @see https://shelving.cc/db/ValidationDBProvider
 */
export class ValidationDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	/** Validate the item after reading; throws `ValueError` if it fails the collection schema. */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return _validateItem(collection, await super.getItem(collection, id), this.getItem);
	}

	/** Validate each emitted item; throws `ValueError` if one fails the collection schema. */
	override async *getItemSequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
	): OptionalItemSequence<II, TT> {
		for await (const item of super.getItemSequence(collection, id)) yield _validateItem(collection, item, this.getItemSequence);
	}

	/** Validate the data before writing and the returned id after; throws `ValueError` on failure. */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		return _validateIdentifier(collection, await super.addItem(collection, collection.validate(data)), this.addItem);
	}

	/** Validate the data before writing; throws `ValueError` if it fails the collection schema. */
	override setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		return super.setItem(collection, id, collection.validate(data));
	}

	/** Validate the updates before writing; throws `ValueError` if they fail the collection schema. */
	override updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		return super.updateItem(collection, id, _validateUpdates(collection, updates, this.updateItem));
	}

	/** Validate the query before reading; throws `ValueError` if it fails the collection schema. */
	override countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return super.countQuery(collection, _validateQuery(collection, query, this.countQuery));
	}

	/** Validate the query before reading and the items after; throws `ValueError` if either fails the collection schema. */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		return _validateItems(collection, await super.getQuery(collection, _validateQuery(collection, query, this.getQuery)), this.getQuery);
	}

	/** Validate the query before reading and each emitted result; throws `ValueError` if either fails the collection schema. */
	override async *getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		const valid = _validateQuery(collection, query, this.getQuerySequence);
		for await (const items of super.getQuerySequence(collection, valid)) yield _validateItems(collection, items, this.getQuerySequence);
	}

	/**
	 * Validate the query and data before writing; throws `ValueError` if they fail the collection schema.
	 * - Passthrough, not two-step: validation applies to the query write's own inputs up front, so per-item routing adds nothing — pass through to keep the source's native query write.
	 */
	override setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		return this.source.setQuery(collection, _validateQuery(collection, query, this.setQuery), collection.validate(data));
	}

	/**
	 * Validate the query and updates before writing; throws `ValueError` if they fail the collection schema.
	 * - Passthrough, not two-step: validation applies to the query write's own inputs up front, so per-item routing adds nothing — pass through to keep the source's native query write.
	 */
	override updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		return this.source.updateQuery(
			collection,
			_validateQuery(collection, query, this.updateQuery),
			_validateUpdates(collection, updates, this.updateQuery),
		);
	}

	/**
	 * Validate the query before writing; throws `ValueError` if it fails the collection schema.
	 * - Passthrough, not two-step: there are no inputs to validate per item, so keep the source's native query write.
	 */
	override deleteQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query: Query<Item<II, TT>>): Promise<void> {
		return this.source.deleteQuery(collection, _validateQuery(collection, query, this.deleteQuery));
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
 */
function _validateUpdates<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	updates: Updates<T>,
	caller: AnyCaller,
): Updates<T> {
	try {
		return collection.updates.validate(updates);
	} catch (thrown) {
		if (typeof thrown !== "string") throw thrown;
		throw new ValueError(`Invalid updates for "${collection}"\n${thrown}`, { received: updates, caller });
	}
}

/**
 * Validate a query for a collection.
 * @throws `ValueError` if the query does not validate (conflict because the program is not in an expected state).
 */
function _validateQuery<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	query: Query<Item<I, T>>,
	caller: AnyCaller,
): Query<Item<I, T>>;
function _validateQuery<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	query: Query<Item<I, T>> | undefined,
	caller: AnyCaller,
): Query<Item<I, T>> | undefined;
function _validateQuery<I extends Identifier, T extends Data>(
	collection: Collection<string, I, T>,
	query: Query<Item<I, T>> | undefined,
	caller: AnyCaller,
): Query<Item<I, T>> | undefined {
	if (!query) return undefined;
	try {
		return collection.query.validate(query);
	} catch (thrown) {
		if (typeof thrown !== "string") throw thrown;
		throw new ValueError(`Invalid query for "${collection}"\n${thrown}`, { received: query, caller });
	}
}
