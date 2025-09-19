import type { ImmutableArray } from "./array.js";
import type { Data } from "./data.js";

/** Allowed types for the "id" property (identifier) for an item. */
export type Identifier = string | number;

/** An item object is a data object that includes an "id" identifier property that is either a string or number. */
export type Item<I extends Identifier, T extends Data> = { id: I } & T;

/** Entity or `undefined` to indicate the item doesn't exist. */
export type OptionalItem<I extends Identifier, T extends Data> = Item<I, T> | undefined;

/** Get the identifier from an item object. */
export function getIdentifier<I extends Identifier, T extends Data>({ id }: Item<I, T>): I {
	return id;
}

/** Get the identifiers from an iterable set item objects. */
export function* getIdentifiers<I extends Identifier, T extends Data>(entities: Iterable<Item<I, T>>): Iterable<I> {
	for (const { id } of entities) yield id;
}

/** Does a data object or data item object. */
export function hasIdentifier<I extends Identifier, T extends Data>(item: T | Item<I, T>, id: I): item is Item<I, T> {
	return item.id === id;
}

/** Merge an ID into a set of data to make an `ItemData` */
export function getItem<I extends Identifier, T extends Data>(id: I, data: T | Item<I, T>): Item<I, T> {
	return hasIdentifier(data, id) ? data : { ...data, id };
}

/** An array of item data. */
export type Items<I extends Identifier, T extends Data> = ImmutableArray<Item<I, T>>;
