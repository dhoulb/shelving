import type { Datas, Key } from "../util/data.js";
import { splitString } from "../util/string.js";
import { DataUpdate } from "../update/DataUpdate.js";
import type { Provider, AsyncProvider } from "../provider/Provider.js";
import type { SynchronousDatabase, AsynchronousDatabase } from "./Database.js";

/**
 * Change set of operations to run against a database in `{ "collection/id": data | DataUpdate | null }`  format.
 * - If data is an object, sets the document.
 * - If data is a `DataUpdate` instance, updates the document.
 * - If data is null, deletes the document.
 */
export type Changes<DB extends Datas> = {
	[K in Key<DB> as `${K}/${string}`]: DB[K] | DataUpdate<DB[K]> | null;
};

/** Apply a set of changes to a synchronous database. */
export function changeSynchronousDatabase<T extends Datas>({ provider }: SynchronousDatabase<T>, changes: Changes<T>): Changes<T> {
	return changeSynchronousProvider(provider, changes);
}

/** Apply a set of changes to an asynchronous database. */
export function changeAsynchronousDatabase<T extends Datas>({ provider }: AsynchronousDatabase<T>, changes: Changes<T>): Promise<Changes<T>> {
	return changeAsynchronousProvider(provider, changes);
}

/** Apply a set of changes to a synchronous provider. */
export function changeSynchronousProvider<T extends Datas>(provider: Provider<T>, changes: Changes<T>): Changes<T> {
	for (const [key, change] of Object.entries(changes)) {
		const [collection, id] = splitString(key, "/", 2);
		if (!change) provider.deleteDocument({ collection, id });
		else if (change instanceof DataUpdate) provider.updateDocument({ collection, id }, change);
		else provider.setDocument({ collection, id }, change);
	}
	return changes;
}

/** Apply a set of changes to an asynchronous provider. */
export async function changeAsynchronousProvider<T extends Datas>(provider: AsyncProvider<T>, changes: Changes<T>): Promise<Changes<T>> {
	for (const [key, change] of Object.entries(changes)) {
		const [collection, id] = splitString(key, "/", 2);
		if (!change) await provider.deleteDocument({ collection, id });
		else if (change instanceof DataUpdate) await provider.updateDocument({ collection, id }, change);
		else await provider.setDocument({ collection, id }, change);
	}
	return changes;
}
