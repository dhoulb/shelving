import type { Datas, Key } from "../util/data.js";
import { splitString } from "../util/string.js";
import { DataUpdate } from "../update/DataUpdate.js";
import type { Provider, AsyncProvider } from "../provider/Provider.js";
import type { Database, AsyncDatabase } from "./Database.js";

/**
 * Change set of operations to run against a database in `{ "collection/id": data | DataUpdate | null }`  format.
 * - If data is an object, sets the item.
 * - If data is a `DataUpdate` instance, updates the item.
 * - If data is null, deletes the item.
 * - If data is undefined, skip the item.
 */
export type Changes<DB extends Datas> = {
	[K in Key<DB> as `${K}/${string}`]: DB[K] | DataUpdate<DB[K]> | null | undefined;
};

/** Apply a set of changes to a synchronous database. */
export function changeDatabase<T extends Datas>({ provider }: Database<T>, changes: Changes<T>): Changes<T> {
	return changeProvider(provider, changes);
}

/** Apply a set of changes to an asynchronous database. */
export function changeAsyncDatabase<T extends Datas>({ provider }: AsyncDatabase<T>, changes: Changes<T>): Promise<Changes<T>> {
	return changeAsyncProvider(provider, changes);
}

/** Apply a set of changes to a synchronous provider. */
export function changeProvider<T extends Datas>(provider: Provider<T>, changes: Changes<T>): Changes<T> {
	for (const [key, change] of Object.entries(changes)) {
		const [collection, id] = splitString(key, "/", 2);
		if (change === undefined) continue;
		else if (change === null) provider.deleteItem(collection, id);
		else if (change instanceof DataUpdate) provider.updateItem(collection, id, change);
		else provider.setItem(collection, id, change);
	}
	return changes;
}

/** Apply a set of changes to an asynchronous provider. */
export async function changeAsyncProvider<T extends Datas>(provider: AsyncProvider<T>, changes: Changes<T>): Promise<Changes<T>> {
	for (const [key, change] of Object.entries(changes)) {
		const [collection, id] = splitString(key, "/", 2);
		if (change === undefined) continue;
		else if (change === null) await provider.deleteItem(collection, id);
		else if (change instanceof DataUpdate) await provider.updateItem(collection, id, change);
		else await provider.setItem(collection, id, change);
	}
	return changes;
}
