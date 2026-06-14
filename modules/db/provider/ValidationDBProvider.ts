import { ValueError } from "../../error/ValueError.js";
import { PARTIAL } from "../../schema/DataSchema.js";
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
 * - Validation failures here are program-state errors, so they throw a typed `ValueError` rather than a raw validation `string`.
 *
 * @example
 *  const provider = new ValidationDBProvider(new FirestoreProvider());
 *  await provider.setItem(users, 123, { name: "Dave", age: 40 }); // Validates before writing.
 *
 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider
 */
export class ValidationDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	/**
	 * Get an item by its id and validate it, or `undefined` if it doesn't exist.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to get.
	 * @returns The validated item, or `undefined` if no item exists with that id.
	 * @throws `ValueError` if the stored item does not validate against the collection schema.
	 * @example await provider.getItem(users, 123) // Validated item or undefined.
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/getItem
	 */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return _validateItem(collection, await super.getItem(collection, id), this.getItem);
	}

	/**
	 * Subscribe to live changes for a single item, validating each emission.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to subscribe to.
	 * @returns Async sequence yielding the validated item (or `undefined`) on every change.
	 * @throws `ValueError` if an emitted item does not validate against the collection schema.
	 * @example for await (const item of provider.getItemSequence(users, 123)) console.log(item);
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/getItemSequence
	 */
	override async *getItemSequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
	): OptionalItemSequence<II, TT> {
		for await (const item of super.getItemSequence(collection, id)) yield _validateItem(collection, item, this.getItemSequence);
	}

	/**
	 * Validate and add a new item, returning its validated generated id.
	 *
	 * @param collection Collection to add the item to.
	 * @param data Data for the new item (validated before writing).
	 * @returns The validated generated identifier for the new item.
	 * @throws `ValueError` if the data or returned id does not validate against the collection schema.
	 * @example await provider.addItem(users, { name: "Dave", age: 40 }) // 123
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		return _validateIdentifier(collection, await super.addItem(collection, collection.validate(data)), this.addItem);
	}

	/**
	 * Validate and set (insert or overwrite) the data for an item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to set.
	 * @param data Full data to store for the item (validated before writing).
	 * @throws `ValueError` if the data does not validate against the collection schema.
	 * @example await provider.setItem(users, 123, { name: "Dave", age: 40 });
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/setItem
	 */
	override setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		return super.setItem(collection, id, collection.validate(data));
	}

	/**
	 * Validate and apply partial updates to an existing item by its id.
	 *
	 * @param collection Collection the item belongs to.
	 * @param id Identifier of the item to update.
	 * @param updates Updates to apply (validated before writing).
	 * @throws `ValueError` if the updates do not validate against the collection schema.
	 * @example await provider.updateItem(users, 123, { age: 41 });
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/updateItem
	 */
	override updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		return super.updateItem(collection, id, _validateUpdates(collection, updates, this.updateItem));
	}

	/**
	 * Count the items in a collection matching an optional query (passed straight through).
	 *
	 * @param collection Collection to count items in.
	 * @param query Query to filter the counted items (counts all items when omitted).
	 * @returns The number of matching items.
	 * @example await provider.countQuery(users, { age: 40 }) // 7
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/countQuery
	 */
	override countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return super.countQuery(collection, query);
	}

	/**
	 * Get the items matching an optional query and validate them.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items (returns all items when omitted).
	 * @returns An array of validated matching items.
	 * @throws `ValueError` if one or more stored items do not validate against the collection schema.
	 * @example await provider.getQuery(users, { age: 40, $order: "name" }) // Validated items.
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/getQuery
	 */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		return _validateItems(collection, await super.getQuery(collection, query), this.getQuery);
	}

	/**
	 * Subscribe to live changes for a query, validating each emitted result.
	 *
	 * @param collection Collection to query.
	 * @param query Query to filter, sort, and limit the items.
	 * @returns Async sequence yielding the validated matching items on every change.
	 * @throws `ValueError` if one or more emitted items do not validate against the collection schema.
	 * @example for await (const items of provider.getQuerySequence(users, { age: 40 })) console.log(items);
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/getQuerySequence
	 */
	override async *getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		for await (const items of super.getQuerySequence(collection, query)) yield _validateItems(collection, items, this.getQuerySequence);
	}

	/**
	 * Validate and set (overwrite) the data for every item matching a query.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to set.
	 * @param data Full data to store for each matching item (validated before writing).
	 * @throws `ValueError` if the data does not validate against the collection schema.
	 * @example await provider.setQuery(users, { age: 40 }, { name: "Dave", age: 41 });
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/setQuery
	 */
	override setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		return super.setQuery(collection, query, collection.validate(data));
	}

	/**
	 * Validate and apply partial updates to every item matching a query.
	 *
	 * @param collection Collection to write to.
	 * @param query Query selecting the items to update.
	 * @param updates Updates to apply to each matching item (validated before writing).
	 * @throws `ValueError` if the updates do not validate against the collection schema.
	 * @example await provider.updateQuery(users, { age: 40 }, { active: true });
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/updateQuery
	 */
	override updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		return super.updateQuery(collection, query, _validateUpdates(collection, updates, this.updateQuery));
	}

	/**
	 * Delete every item matching a query (passed straight through).
	 *
	 * @param collection Collection to delete from.
	 * @param query Query selecting the items to delete.
	 * @example await provider.deleteQuery(users, { active: false });
	 * @see https://dhoulb.github.io/shelving/db/provider/ValidationDBProvider/ValidationDBProvider/deleteQuery
	 */
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
