import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { ImmutableArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import type { Updates } from "../util/update.js";
import { type Optional, notOptional } from "../util/optional.js";

/** A change to a database. */
export interface Change {
	readonly action: string;
}

/** A change to a database collection. */
export interface CollectionChange<T extends Data> extends Change {
	readonly collection: string;
	readonly id?: string | never;
	readonly query?: ItemQuery<T> | never;
}

/** Add an item to a database collection. */
export interface AddItemChange<T extends Data> extends CollectionChange<T> {
	readonly action: "add";
	readonly id?: never;
	readonly query?: never;
	readonly data: T;
}

/** Change an item in a database collection. */
export interface ItemChange<T extends Data> extends CollectionChange<T> {
	readonly id: string;
	readonly query?: never;
}

/** Set an item in a database collection. */
export interface SetItemChange<T extends Data> extends ItemChange<T> {
	readonly action: "set";
	readonly data: T;
}

/** Update an item in a database collection. */
export interface UpdateItemChange<T extends Data> extends ItemChange<T> {
	readonly action: "update";
	readonly updates: Updates<T>;
}

/** Delete an item in a database collection. */
export interface DeleteItemChange<T extends Data> extends ItemChange<T> {
	readonly action: "delete";
}

/** Change multiple items in a database collection. */
export interface QueryChange<T extends Data> extends CollectionChange<T> {
	readonly query: ItemQuery<T>;
	readonly id?: never;
}

/** Set multiple items in a database collection. */
export interface SetQueryChange<T extends Data> extends QueryChange<T> {
	readonly action: "set";
	readonly data: T;
}

/** Update multiple items in a database collection. */
export interface UpdateQueryChange<T extends Data> extends QueryChange<T> {
	readonly action: "update";
	readonly updates: Updates<T>;
}

/** Delete multiple items in a database collection. */
export interface DeleteQueryChange<T extends Data> extends QueryChange<T> {
	readonly action: "delete";
}

/** Write an item in a database collection. */
export type WriteItemChange<T extends Data> = SetItemChange<T> | UpdateItemChange<T> | DeleteItemChange<T>;

/** Write multiple item in a database collection. */
export type WriteQueryChange<T extends Data> = SetQueryChange<T> | UpdateQueryChange<T> | DeleteQueryChange<T>;

/** Write an item or multiple items in a database collection. */
export type WriteChange<T extends Data> = AddItemChange<T> | WriteItemChange<T> | WriteQueryChange<T>;

/** Write an item or multiple items in a database collection. */
export type WriteChanges<T extends Data> = ImmutableArray<WriteChange<T>>;

/** Write a set of changes to a synchronous provider. */
export function writeProviderChanges<T extends Data>(provider: Provider, ...changes: Optional<WriteChange<T>>[]): WriteChanges<T> {
	return changes.filter(notOptional).map(change => writeProviderChange(provider, change));
}

/**
 * Write a single change to a synchronous provider.
 * @param change Change that should be written.
 * @return Change that was written.
 */
export function writeProviderChange<T extends Data>(provider: Provider, change: WriteChange<T>): WriteChange<T> {
	const { action, collection, id, query } = change;
	if (action === "add") {
		// `add` change returns a `set` change so it includes the ID to reflect the change that was written.
		return { action: "set", collection, id: provider.addItem(collection, change.data), data: change.data };
	} else if (id) {
		if (action === "set") provider.setItem(collection, id, change.data);
		else if (action === "update") provider.updateItem(collection, id, change.updates);
		else if (action === "delete") provider.deleteItem(collection, id);
	} else if (query) {
		if (action === "set") provider.setQuery(collection, query, change.data);
		else if (action === "update") provider.updateQuery(collection, query, change.updates);
		else if (action === "delete") provider.deleteQuery(collection, query);
	}
	return change;
}

/** Write a set of changes to an asynchronous provider. */
export function writeAsyncProviderChanges<T extends Data>(provider: AsyncProvider, ...changes: Optional<WriteChange<T>>[]): Promise<WriteChanges<T>> {
	return Promise.all(changes.filter(notOptional).map(change => writeAsyncProviderChange(provider, change)));
}

/**
 * Write a single change to an asynchronous provider.
 * @param change Change that should be written.
 * @return Change that was written.
 */
export async function writeAsyncProviderChange<T extends Data>(provider: AsyncProvider, change: WriteChange<T>): Promise<WriteChange<T>> {
	const { collection, action, id, query } = change;
	if (action === "add") {
		// `add` change returns a `set` change so it includes the ID to reflect the change that was written.
		return { action: "set", collection, id: await provider.addItem(collection, change.data), data: change.data };
	} else if (id) {
		if (action === "set") await provider.setItem(collection, id, change.data);
		else if (action === "update") await provider.updateItem(collection, id, change.updates);
		else if (action === "delete") await provider.deleteItem(collection, id);
	} else if (query) {
		if (action === "set") await provider.setQuery(collection, query, change.data);
		else if (action === "update") await provider.updateQuery(collection, query, change.updates);
		else if (action === "delete") await provider.deleteQuery(collection, query);
	}
	return change;
}
