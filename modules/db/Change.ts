import type { Data, Datas, Key } from "../util/data.js";
import type { ImmutableArray } from "../util/array.js";
import type { Provider, AsyncProvider } from "../provider/Provider.js";
import { DataUpdate } from "../update/DataUpdate.js";
import { QueryConstraints } from "../constraint/QueryConstraints.js";
import { FilterConstraint } from "../constraint/FilterConstraint.js";
import { notNullish, Nullish } from "../util/null.js";
import { DeepIterable, flattenDeepIterable } from "../util/iterate.js";
import type { ItemConstraints, ItemData } from "./Item.js";

export interface Change<T extends Datas, K extends Key<T>> {
	readonly action: string;
	readonly collection: K;
}

/** Add on an item. */
export interface AddChange<T extends Datas, K extends Key<T>> extends Change<T, K> {
	readonly action: "ADD";
	readonly collection: K;
	readonly data: T[K];
}

/** Set on an item. */
export interface SetChange<T extends Datas, K extends Key<T>> extends Change<T, K> {
	readonly action: "SET";
	readonly collection: K;
	readonly id: string;
	readonly data: T[K];
}

/** Update change on an item. */
export interface UpdateChange<T extends Datas, K extends Key<T>> extends Change<T, K> {
	readonly action: "UPDATE";
	readonly collection: K;
	readonly id: string;
	readonly update: DataUpdate<T[K]>;
}

/** Delete change on an item. */
export interface DeleteChange<T extends Datas, K extends Key<T>> extends Change<T, K> {
	readonly action: "DELETE";
	readonly collection: K;
	readonly id: string;
}

/** Set, update, or delete change on an item. */
export type ItemChange<T extends Datas, K extends Key<T> = Key<T>> = SetChange<T, K> | UpdateChange<T, K> | DeleteChange<T, K>;

/** Array of item changes. */
export type ItemChanges<T extends Datas, K extends Key<T> = Key<T>> = ImmutableArray<ItemChange<T, K>>;

/** Write change on an item. */
export type WriteChange<T extends Datas, K extends Key<T> = Key<T>> = ItemChange<T, K> | AddChange<T, K>;

/** Array of write changes. */
export type WriteChanges<T extends Datas, K extends Key<T> = Key<T>> = ImmutableArray<WriteChange<T, K>>;

/** Apply a set of changes to a synchronous provider. */
export function changeProvider<T extends Datas, K extends Key<T> = Key<T>>(provider: Provider<T>, ...changes: DeepIterable<Nullish<WriteChange<T, K>>>[]): ItemChanges<T, K> {
	return Array.from(flattenDeepIterable(changes)).filter(notNullish).map(_changeItem, provider);
}
function _changeItem<T extends Datas, K extends Key<T>>(this: Provider<T>, change: WriteChange<T, K>): ItemChange<T, K> {
	const { action, collection } = change;
	if (action === "ADD") return { action: "SET", collection, id: this.addItem(collection, change.data), data: change.data };
	else if (action === "SET") this.setItem(collection, change.id, change.data);
	else if (action === "UPDATE") this.updateQuery(collection, _getItemConstraint(change.id), change.update);
	else if (action === "DELETE") this.deleteItem(collection, change.id);
	return change;
}

/** Apply a set of changes to an asynchronous provider. */
export function changeAsyncProvider<T extends Datas, K extends Key<T>>(provider: AsyncProvider<T>, ...changes: DeepIterable<Nullish<WriteChange<T, K>>>[]): Promise<ItemChanges<T, K>> {
	return Promise.all(Array.from(flattenDeepIterable(changes)).filter(notNullish).map(_changeAsyncItem, provider));
}
async function _changeAsyncItem<T extends Datas, K extends Key<T>>(this: AsyncProvider<T>, change: WriteChange<T, K>): Promise<ItemChange<T, K>> {
	const { collection, action } = change;
	if (action === "ADD") return { action: "SET", collection, id: await this.addItem(collection, change.data), data: change.data };
	else if (action === "SET") await this.setItem(collection, change.id, change.data);
	else if (action === "UPDATE") await this.updateQuery(collection, _getItemConstraint(change.id), change.update);
	else if (action === "DELETE") await this.deleteItem(collection, change.id);
	return change;
}

export function _getItemConstraint<T extends Data>(id: string): ItemConstraints<ItemData<T>> {
	return new QueryConstraints(new FilterConstraint("id", id), undefined, 1);
}
