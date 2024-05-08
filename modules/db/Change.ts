import type { ImmutableArray } from "../util/array.js";
import type { DataKey, Database } from "../util/data.js";
import type { ItemQuery } from "../util/item.js";
import { type Optional, notOptional } from "../util/optional.js";
import type { Updates } from "../util/update.js";
import type { AsyncProvider, Provider } from "./Provider.js";

/** A change to a database. */
export interface Change {
	readonly action: string;
}

/** A change to a database collection. */
export interface CollectionChange<T extends Database, K extends DataKey<T>> extends Change {
	readonly collection: K;
}

/** Add an item to a database collection. */
export interface ItemAddChange<T extends Database, K extends DataKey<T>> extends CollectionChange<T, K> {
	readonly action: "add";
	readonly id?: never;
	readonly query?: never;
	readonly data: T[K];
}

/** Change an item in a database collection. */
export interface ItemChange<T extends Database, K extends DataKey<T>> extends CollectionChange<T, K> {
	readonly id: string;
	readonly query?: never;
}

/** Set an item in a database collection. */
export interface ItemSetChange<T extends Database, K extends DataKey<T>> extends ItemChange<T, K> {
	readonly action: "set";
	readonly data: T[K];
}

/** Update an item in a database collection. */
export interface ItemUpdateChange<T extends Database, K extends DataKey<T>> extends ItemChange<T, K> {
	readonly action: "update";
	readonly updates: Updates<T[K]>;
}

/** Delete an item in a database collection. */
export interface ItemDeleteChange<T extends Database, K extends DataKey<T>> extends ItemChange<T, K> {
	readonly action: "delete";
}

/** Change multiple items in a database collection. */
export interface QueryChange<T extends Database, K extends DataKey<T>> extends CollectionChange<T, K> {
	readonly query: ItemQuery<T[K]>;
	readonly id?: never;
}

/** Set multiple items in a database collection. */
export interface QuerySetChange<T extends Database, K extends DataKey<T>> extends QueryChange<T, K> {
	readonly action: "set";
	readonly data: T[K];
}

/** Update multiple items in a database collection. */
export interface QueryUpdateChange<T extends Database, K extends DataKey<T>> extends QueryChange<T, K> {
	readonly action: "update";
	readonly updates: Updates<T[K]>;
}

/** Delete multiple items in a database collection. */
export interface QueryDeleteChange<T extends Database, K extends DataKey<T>> extends QueryChange<T, K> {
	readonly action: "delete";
}

/** Write an item in a set of collection. */
export type DatabaseItemChange<T extends Database> =
	| ItemSetChange<T, DataKey<T>>
	| ItemUpdateChange<T, DataKey<T>>
	| ItemDeleteChange<T, DataKey<T>>;

/** Write multiple item in a set of collection. */
export type DatabaseQueryChange<T extends Database> =
	| QuerySetChange<T, DataKey<T>>
	| QueryUpdateChange<T, DataKey<T>>
	| QueryDeleteChange<T, DataKey<T>>;

/** Write an item or multiple items in a set of collection. */
export type DatabaseChange<T extends Database> = ItemAddChange<T, DataKey<T>> | DatabaseItemChange<T> | DatabaseQueryChange<T>;

/** Write an item or multiple items in a set of collection. */
export type DatabaseChanges<T extends Database> = ImmutableArray<DatabaseChange<T>>;

/** Write a single change to a synchronous provider and return an array of the changes that were written. */
export function writeChange<T extends Database>(provider: Provider<T>, change: DatabaseChange<T>): DatabaseChange<T> {
	const { action, collection, id, query } = change;
	if (action === "add") {
		// `add` change returns a `set` change so it includes the ID to reflect the change that was written.
		return { action: "set", collection, id: provider.addItem(collection, change.data), data: change.data };
	}
	if (id) {
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

/** Write a set of changes to a synchronous provider. */
export function writeChanges<T extends Database>(provider: Provider<T>, ...changes: Optional<DatabaseChange<T>>[]): DatabaseChanges<T> {
	return changes.filter(notOptional).map(change => writeChange(provider, change));
}

/** Write a single change to an asynchronous provider and return the change that was written. */
export async function writeAsyncChange<T extends Database>(
	provider: AsyncProvider<T>,
	change: DatabaseChange<T>,
): Promise<DatabaseChange<T>> {
	const { collection, action, id, query } = change;
	if (action === "add") {
		// `add` change returns a `set` change so it includes the ID to reflect the change that was written.
		return { action: "set", collection, id: await provider.addItem(collection, change.data), data: change.data };
	}
	if (id) {
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

/** Write a set of changes to an asynchronous provider. */
export function writeAsyncChanges<T extends Database>(
	provider: AsyncProvider<T>,
	...changes: Optional<DatabaseChange<T>>[]
): Promise<DatabaseChanges<T>> {
	return Promise.all(changes.filter(notOptional).map(change => writeAsyncChange(provider, change)));
}
