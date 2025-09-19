import type { ImmutableArray } from "../util/array.js";
import type { DataKey, Database } from "../util/data.js";
import type { Identifier } from "../util/item.js";
import { type Nullish, notNullish } from "../util/null.js";
import type { ItemQuery } from "../util/query.js";
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
export interface ItemChange<I extends Identifier, T extends Database, K extends DataKey<T>> extends CollectionChange<T, K> {
	readonly id: I;
	readonly query?: never;
}

/** Set an item in a database collection. */
export interface ItemSetChange<I extends Identifier, T extends Database, K extends DataKey<T>> extends ItemChange<I, T, K> {
	readonly action: "set";
	readonly data: T[K];
}

/** Update an item in a database collection. */
export interface ItemUpdateChange<I extends Identifier, T extends Database, K extends DataKey<T>> extends ItemChange<I, T, K> {
	readonly action: "update";
	readonly updates: Updates<T[K]>;
}

/** Delete an item in a database collection. */
export interface ItemDeleteChange<I extends Identifier, T extends Database, K extends DataKey<T>> extends ItemChange<I, T, K> {
	readonly action: "delete";
}

/** Change multiple items in a database collection. */
export interface QueryChange<I extends Identifier, T extends Database, K extends DataKey<T>> extends CollectionChange<T, K> {
	readonly query: ItemQuery<I, T[K]>;
	readonly id?: never;
}

/** Set multiple items in a database collection. */
export interface QuerySetChange<I extends Identifier, T extends Database, K extends DataKey<T>> extends QueryChange<I, T, K> {
	readonly action: "set";
	readonly data: T[K];
}

/** Update multiple items in a database collection. */
export interface QueryUpdateChange<I extends Identifier, T extends Database, K extends DataKey<T>> extends QueryChange<I, T, K> {
	readonly action: "update";
	readonly updates: Updates<T[K]>;
}

/** Delete multiple items in a database collection. */
export interface QueryDeleteChange<I extends Identifier, T extends Database, K extends DataKey<T>> extends QueryChange<I, T, K> {
	readonly action: "delete";
}

/** Write an item in a set of collection. */
export type DatabaseItemChange<I extends Identifier, T extends Database> =
	| ItemSetChange<I, T, DataKey<T>>
	| ItemUpdateChange<I, T, DataKey<T>>
	| ItemDeleteChange<I, T, DataKey<T>>;

/** Write multiple item in a set of collection. */
export type DatabaseQueryChange<I extends Identifier, T extends Database> =
	| QuerySetChange<I, T, DataKey<T>>
	| QueryUpdateChange<I, T, DataKey<T>>
	| QueryDeleteChange<I, T, DataKey<T>>;

/** Write an item or multiple items in a set of collection. */
export type DatabaseChange<I extends Identifier, T extends Database> =
	| ItemAddChange<T, DataKey<T>>
	| DatabaseItemChange<I, T>
	| DatabaseQueryChange<I, T>;

/** Write an item or multiple items in a set of collection. */
export type DatabaseChanges<I extends Identifier, T extends Database> = ImmutableArray<DatabaseChange<I, T>>;

/** Write a single change to a synchronous provider and return an array of the changes that were written. */
export function writeChange<I extends Identifier, T extends Database>(
	provider: Provider<I, T>,
	change: DatabaseChange<I, T>,
): DatabaseChange<I, T> {
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
export function writeChanges<I extends Identifier, T extends Database>(
	provider: Provider<I, T>,
	...changes: Nullish<DatabaseChange<I, T>>[]
): DatabaseChanges<I, T> {
	return changes.filter(notNullish).map(change => writeChange(provider, change));
}

/** Write a single change to an asynchronous provider and return the change that was written. */
export async function writeAsyncChange<I extends Identifier, T extends Database>(
	provider: AsyncProvider<I, T>,
	change: DatabaseChange<I, T>,
): Promise<DatabaseChange<I, T>> {
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
export function writeAsyncChanges<I extends Identifier, T extends Database>(
	provider: AsyncProvider<I, T>,
	...changes: Nullish<DatabaseChange<I, T>>[]
): Promise<DatabaseChanges<I, T>> {
	return Promise.all(changes.filter(notNullish).map(change => writeAsyncChange(provider, change)));
}
