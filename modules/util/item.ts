import type { ImmutableArray } from "./array.js";
import type { Data } from "./data.js";

/**
 * Allowed types for the "id" property (identifier) for an item.
 *
 * @see https://shelving.cc/util/item/Identifier
 */
export type Identifier = string | number;

/**
 * An item object is a data object that includes an "id" identifier property that is either a string or number.
 *
 * @see https://shelving.cc/util/item/Item
 */
export type Item<I extends Identifier = Identifier, T extends Data = Data> = { id: I } & T;

/**
 * Item object, or `undefined` to indicate the item doesn't exist.
 *
 * @see https://shelving.cc/util/item/OptionalItem
 */
export type OptionalItem<I extends Identifier = Identifier, T extends Data = Data> = Item<I, T> | undefined;

/**
 * An async sequence of item objects.
 *
 * @see https://shelving.cc/util/item/ItemSequence
 */
export type ItemSequence<I extends Identifier = Identifier, T extends Data = Data> = AsyncIterable<Item<I, T>, void, void>;

/**
 * An async sequence of optional item objects.
 *
 * @see https://shelving.cc/util/item/OptionalItemSequence
 */
export type OptionalItemSequence<I extends Identifier = Identifier, T extends Data = Data> = AsyncIterable<OptionalItem<I, T>, void, void>;

/**
 * An array of item objects.
 *
 * @see https://shelving.cc/util/item/Items
 */
export type Items<I extends Identifier = Identifier, T extends Data = Data> = ImmutableArray<Item<I, T>>;

/**
 * An async sequence of arrays of item objects.
 *
 * @see https://shelving.cc/util/item/ItemsSequence
 */
export type ItemsSequence<I extends Identifier = Identifier, T extends Data = Data> = AsyncIterable<Items<I, T>, void, void>;

/**
 * Get the identifier from an item object.
 *
 * @param item The item object to read the `id` from.
 * @returns The item's `id` identifier.
 * @example getIdentifier({ id: "abc", name: "Dave" }) // "abc"
 * @see https://shelving.cc/util/item/getIdentifier
 */
export function getIdentifier<I extends Identifier, T extends Data>({ id }: Item<I, T>): I {
	return id;
}

/**
 * Get the identifiers from an iterable set of item objects.
 *
 * @param entities The iterable of item objects to read identifiers from.
 * @returns An iterable yielding the `id` of each item.
 * @example Array.from(getIdentifiers([{ id: "a" }, { id: "b" }])) // ["a", "b"]
 * @see https://shelving.cc/util/item/getIdentifiers
 */
export function* getIdentifiers<I extends Identifier, T extends Data>(entities: Iterable<Item<I, T>>): Iterable<I> {
	for (const { id } of entities) yield id;
}

/**
 * Does a data object have a given identifier (and is therefore an `Item`).
 *
 * @param item The data or item object to test.
 * @param id The identifier to match against the object's `id` property.
 * @returns `true` if `item.id` equals `id`, otherwise `false`.
 * @example hasIdentifier({ id: "abc" }, "abc") // true
 * @see https://shelving.cc/util/item/hasIdentifier
 */
export function hasIdentifier<I extends Identifier, T extends Data>(item: T | Item<I, T>, id: I): item is Item<I, T> {
	return item.id === id;
}

/**
 * Merge an ID into a set of data to make an `Item`.
 * - Returns the data unchanged if it already has the given `id`.
 *
 * @param id The identifier to set on the data.
 * @param data The data or item object to attach the identifier to.
 * @returns An item object with the given `id`.
 * @example getItem("abc", { name: "Dave" }) // { name: "Dave", id: "abc" }
 * @see https://shelving.cc/util/item/getItem
 */
export function getItem<I extends Identifier, T extends Data>(id: I, data: T | Item<I, T>): Item<I, T> {
	return hasIdentifier(data, id) ? data : { ...data, id };
}
