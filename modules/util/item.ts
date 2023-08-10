import type { ImmutableArray } from "./array.js";
import type { Query } from "./query.js";
import { type Data, isData } from "./data.js";

/** Item data with a string ID that uniquely identifies it. */
export type ItemData<T extends Data = Data> = T & { id: string };

/** Entity or `null` to indicate the item doesn't exist. */
export type ItemValue<T extends Data = Data> = ItemData<T> | undefined;

/** Get the ID from item data. */
export function getItemID<T extends Data>({ id }: ItemData<T>): string {
	return id;
}

/** Get the IDs of an iterable set item data. */
export function* getItemIDs<T extends Data>(entities: Iterable<ItemData<T>>): Iterable<string> {
	for (const { id } of entities) yield id;
}

/** Is a data value an item? */
export function isItemData<T extends Data>(v: T | ItemData<T>): v is ItemData<T> {
	return isData(v) && typeof v.id === "string";
}

/** Merge an ID into a set of data to make an `ItemData` */
export function getItemData<T extends Data>(id: string, data: T | ItemData<T>): ItemData<T> {
	return data.id === id ? (data as ItemData<T>) : { ...data, id };
}

/** An array of item data. */
export type ItemArray<T extends Data = Data> = ImmutableArray<ItemData<T>>;

/** A set of query constraints for item data. */
export type ItemQuery<T extends Data = Data> = Query<ItemData<T>>;

/** Get query that targets a single database item by its ID. */
export function getItemQuery<T extends Data>(id: string): Query<ItemData<T>>;
export function getItemQuery(id: string): Query<{ id: string }> {
	return { id, $limit: 1 };
}
