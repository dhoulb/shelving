import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { ImmutableArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import type { Nullish } from "../util/null.js";
import type { Updates } from "../util/update.js";
import { notNullish } from "../util/null.js";
import { mapArray, mapItems } from "../util/transform.js";
import { getItemQuery } from "./ItemReference.js";

/** Add on an item. */
export interface AddChange<T extends Data> {
	readonly action: "add";
	readonly collection: string;
	readonly data: T;
}

/** Set on an item. */
export interface SetChange<T extends Data> {
	readonly action: "set";
	readonly collection: string;
	readonly id: string;
	readonly data: T;
}

/** Update change on an item. */
export interface UpdateChange<T extends Data> {
	readonly action: "update";
	readonly collection: string;
	readonly id: string;
	readonly updates: Updates<T>;
}

/** Delete change on an item. */
export interface DeleteChange {
	readonly action: "delete";
	readonly collection: string;
	readonly id: string;
}

/** Set, update, or delete change on an item. */
export type ItemChange<T extends Data> = SetChange<T> | UpdateChange<T> | DeleteChange;

/** Array of item changes. */
export type ItemChanges = ImmutableArray<ItemChange<Data>>;

/** Write change on an item. */
export type WriteChange<T extends Data> = ItemChange<T> | AddChange<T>;

/** Array of write changes. */
export type WriteChanges = ImmutableArray<WriteChange<Data>>;

/** Apply a set of changes to a synchronous provider. */
export function changeProvider(provider: Provider, ...changes: Nullish<WriteChange<Data>>[]): ItemChanges {
	return mapArray(changes.filter(notNullish), _changeItem, provider);
}
function _changeItem(change: WriteChange<Data>, provider: Provider): ItemChange<Data> {
	const { action, collection } = change;
	if (action === "add") return { action: "set", collection, id: provider.addItem(collection, change.data), data: change.data };
	else if (action === "set") provider.setItem(collection, change.id, change.data);
	else if (action === "update") provider.updateQuery(collection, getItemQuery(change.id), change.updates);
	else if (action === "delete") provider.deleteItem(collection, change.id);
	return change;
}

/** Apply a set of changes to an asynchronous provider. */
export function changeAsyncProvider(provider: AsyncProvider, ...changes: Nullish<WriteChange<Data>>[]): Promise<ItemChanges> {
	return Promise.all(mapItems(changes.filter(notNullish), _changeAsyncItem, provider));
}
async function _changeAsyncItem(change: WriteChange<Data>, provider: AsyncProvider): Promise<ItemChange<Data>> {
	const { collection, action } = change;
	if (action === "add") return { action: "set", collection, id: await provider.addItem(collection, change.data), data: change.data };
	else if (action === "set") await provider.setItem(collection, change.id, change.data);
	else if (action === "update") await provider.updateQuery(collection, getItemQuery(change.id), change.updates);
	else if (action === "delete") await provider.deleteItem(collection, change.id);
	return change;
}
