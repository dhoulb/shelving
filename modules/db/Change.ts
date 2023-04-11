import type { Data } from "../util/data.js";
import type { ImmutableArray } from "../util/array.js";
import type { Provider, AsyncProvider } from "../provider/Provider.js";
import { Updates } from "../update/DataUpdate.js";
import { notNullish, Nullish } from "../util/null.js";
import { DeepIterable, flattenItems } from "../util/iterate.js";
import { getItemConstraints } from "./Item.js";

/** Change on a collection. */
export interface Change {
	readonly action: string;
	readonly collection: string;
}

/** Add on an item. */
export interface AddChange extends Change {
	readonly action: "ADD";
	readonly data: Data;
}

/** Set on an item. */
export interface SetChange extends Change {
	readonly action: "SET";
	readonly id: string;
	readonly data: Data;
}

/** Update change on an item. */
export interface UpdateChange extends Change {
	readonly action: "UPDATE";
	readonly id: string;
	readonly updates: Updates;
}

/** Delete change on an item. */
export interface DeleteChange extends Change {
	readonly action: "DELETE";
	readonly id: string;
}

/** Set, update, or delete change on an item. */
export type ItemChange = SetChange | UpdateChange | DeleteChange;

/** Array of item changes. */
export type ItemChanges = ImmutableArray<ItemChange>;

/** Write change on an item. */
export type WriteChange = ItemChange | AddChange;

/** Array of write changes. */
export type WriteChanges = ImmutableArray<WriteChange>;

/** Apply a set of changes to a synchronous provider. */
export function changeProvider(provider: Provider, ...changes: DeepIterable<Nullish<WriteChange>>[]): ItemChanges {
	return Array.from(flattenItems(changes)).filter(notNullish).map(_changeItem, provider);
}
function _changeItem(this: Provider, change: WriteChange): ItemChange {
	const { action, collection } = change;
	if (action === "ADD") return { action: "SET", collection, id: this.addItem(collection, change.data), data: change.data };
	else if (action === "SET") this.setItem(collection, change.id, change.data);
	else if (action === "UPDATE") this.updateQuery(collection, getItemConstraints(change.id), change.updates);
	else if (action === "DELETE") this.deleteItem(collection, change.id);
	return change;
}

/** Apply a set of changes to an asynchronous provider. */
export function changeAsyncProvider(provider: AsyncProvider, ...changes: DeepIterable<Nullish<WriteChange>>[]): Promise<ItemChanges> {
	return Promise.all(Array.from(flattenItems(changes)).filter(notNullish).map(_changeAsyncItem, provider));
}
async function _changeAsyncItem(this: AsyncProvider, change: WriteChange): Promise<ItemChange> {
	const { collection, action } = change;
	if (action === "ADD") return { action: "SET", collection, id: await this.addItem(collection, change.data), data: change.data };
	else if (action === "SET") await this.setItem(collection, change.id, change.data);
	else if (action === "UPDATE") await this.updateQuery(collection, getItemConstraints(change.id), change.updates);
	else if (action === "DELETE") await this.deleteItem(collection, change.id);
	return change;
}
