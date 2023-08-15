import type { ImmutableArray } from "./array.js";
import type { Query } from "./query.js";
import { type Data } from "./data.js";

/** Item data with a string ID that uniquely identifies it. */
export type Item<T extends Data = Data> = T & { id: string };

/** Entity or `undefined` to indicate the item doesn't exist. */
export type OptionalItem<T extends Data = Data> = Item<T> | undefined;

/** Get the ID from item data. */
export function getItemID<T extends Data>({ id }: Item<T>): string {
	return id;
}

/** Get the IDs of an iterable set item data. */
export function* getItemIDs<T extends Data>(entities: Iterable<Item<T>>): Iterable<string> {
	for (const { id } of entities) yield id;
}

/** Merge an ID into a set of data to make an `ItemData` */
export function getItem<T extends Data>(id: string, data: T | Item<T>): Item<T> {
	return data.id === id ? (data as Item<T>) : { ...data, id };
}

/** An array of item data. */
export type Items<T extends Data = Data> = ImmutableArray<Item<T>>;

/** A set of query constraints for item data. */
export type ItemQuery<T extends Data = Data> = Query<Item<T>>;

/** Get query that targets a single database item by its ID. */
export function getItemQuery<T extends Data>(id: string): Query<Item<T>>;
export function getItemQuery(id: string): Query<{ id: string }> {
	return { id, $limit: 1 };
}
