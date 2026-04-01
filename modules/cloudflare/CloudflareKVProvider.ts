import type { Collection } from "../db/collection/Collection.js";
import { DBProvider } from "../db/provider/DBProvider.js";
import { UnimplementedError } from "../error/UnimplementedError.js";
import { requireArray } from "../util/array.js";
import type { Database, DataKey } from "../util/data.js";
import type { Item, Items, OptionalItem } from "../util/item.js";
import { getItem } from "../util/item.js";
import type { ItemQuery } from "../util/query.js";
import { queryItems } from "../util/query.js";
import type { Updates } from "../util/update.js";
import { updateData } from "../util/update.js";
import { randomUUID } from "../util/uuid.js";

/** Minimal interface matching Cloudflare Workers KV namespace runtime object. */
export interface KVNamespace {
	get(key: string, options: { type: "json" }): Promise<unknown>;
	put(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
	list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
		keys: readonly { name: string }[];
		list_complete: boolean;
		cursor?: string;
	}>;
}

function _getKey(collection: string, id: string): string {
	return `${collection}:${id}`;
}

function _getPrefix(collection: string): string {
	return `${collection}:`;
}

/**
 * Cloudflare Workers KV database provider.
 *
 * Items are stored as JSON values under keys formatted as `collection:id`.
 * The `KVNamespace` object is provided by the Cloudflare Workers runtime environment.
 *
 * ### Supported
 * - Single item operations: `getItem`, `setItem`, `addItem`, `updateItem`, `deleteItem`.
 * - Query operations: `getQuery`, `setQuery`, `updateQuery`, `deleteQuery`, `countQuery`.
 * - All filter operators: equality, not, in, out, contains, gt, gte, lt, lte.
 * - Sorting (`$order`) and limiting (`$limit`).
 * - ID generation: `addItem()` generates a UUID v4 identifier automatically.
 *
 * ### Not supported
 * - **Realtime subscriptions:** `getItemSequence()` and `getQuerySequence()` throw `UnimplementedError`.
 *   KV has no change feed or push notification mechanism.
 *
 * ### Performance limitations
 * - **Querying is expensive:** KV has no native query support. Every `getQuery()` call lists all keys
 *   in the collection (paginated, 1000 keys per page), fetches each value individually, then applies
 *   filtering, sorting, and limiting in-memory. Avoid large collections where possible.
 * - **Non-atomic updates:** `updateItem()` performs a read-modify-write cycle. Concurrent writes to the
 *   same item may cause one write to be lost.
 * - **Eventual consistency:** KV is eventually consistent — reads may return stale data, particularly
 *   shortly after writes. This also affects `updateItem`, `setQuery`, `updateQuery`, and `deleteQuery`
 *   since they read before writing.
 * - **No bulk get:** Each item value must be fetched individually — there is no multi-get API.
 *   Query operations that match N items require N+1 KV requests (one `list` + N `get` calls per page).
 */
export class CloudflareKVProvider<T extends Database> extends DBProvider<string, T> {
	private readonly _kv: KVNamespace;

	constructor(kv: KVNamespace) {
		super();
		this._kv = kv;
	}

	async getItem<K extends DataKey<T>>(c: Collection<K, string, T[K]>, id: string): Promise<OptionalItem<string, T[K]>> {
		const data = (await this._kv.get(_getKey(c.name, id), { type: "json" })) as T[K] | null;
		if (data) return getItem(id, data);
	}

	getItemSequence<K extends DataKey<T>>(c: Collection<K, string, T[K]>, id: string): AsyncIterable<OptionalItem<string, T[K]>> {
		throw new UnimplementedError("CloudflareKVProvider does not support realtime subscriptions");
	}

	async addItem<K extends DataKey<T>>(c: Collection<K, string, T[K]>, data: T[K]): Promise<string> {
		const id = randomUUID();
		await this._kv.put(_getKey(c.name, id), JSON.stringify(data));
		return id;
	}

	async setItem<K extends DataKey<T>>(c: Collection<K, string, T[K]>, id: string, data: T[K]): Promise<void> {
		await this._kv.put(_getKey(c.name, id), JSON.stringify(data));
	}

	async updateItem<K extends DataKey<T>>(c: Collection<K, string, T[K]>, id: string, updates: Updates<T[K]>): Promise<void> {
		const existing = await this.getItem(c, id);
		if (existing) await this.setItem(c, id, updateData<T[K]>(existing, updates));
	}

	async deleteItem<K extends DataKey<T>>(c: Collection<K, string, T[K]>, id: string): Promise<void> {
		await this._kv.delete(_getKey(c.name, id));
	}

	async getQuery<K extends DataKey<T>>(c: Collection<K, string, T[K]>, q?: ItemQuery<string, T[K]>): Promise<Items<string, T[K]>> {
		const all = await this._getAllItems<K>(c.name);
		return q ? requireArray(queryItems(all, q)) : all;
	}

	getQuerySequence<K extends DataKey<T>>(c: Collection<K, string, T[K]>, q?: ItemQuery<string, T[K]>): AsyncIterable<Items<string, T[K]>> {
		throw new UnimplementedError("CloudflareKVProvider does not support realtime subscriptions");
	}

	async setQuery<K extends DataKey<T>>(c: Collection<K, string, T[K]>, q: ItemQuery<string, T[K]>, data: T[K]): Promise<void> {
		const items = await this.getQuery(c, q);
		await Promise.all(items.map(item => this.setItem(c, item.id, data)));
	}

	async updateQuery<K extends DataKey<T>>(
		c: Collection<K, string, T[K]>,
		q: ItemQuery<string, T[K]>,
		updates: Updates<T[K]>,
	): Promise<void> {
		const items = await this.getQuery(c, q);
		await Promise.all(items.map(item => this.setItem(c, item.id, updateData<T[K]>(item, updates))));
	}

	async deleteQuery<K extends DataKey<T>>(c: Collection<K, string, T[K]>, q: ItemQuery<string, T[K]>): Promise<void> {
		const items = await this.getQuery(c, q);
		await Promise.all(items.map(item => this._kv.delete(_getKey(c.name, item.id))));
	}

	/** Fetch all items in a collection, paginating through `kv.list()`. */
	private async _getAllItems<K extends DataKey<T>>(collection: K): Promise<Items<string, T[K]>> {
		const prefix = _getPrefix(collection);
		const items: Item<string, T[K]>[] = [];
		let cursor: string | undefined;
		do {
			const result = await this._kv.list(cursor ? { prefix, cursor } : { prefix });
			const values = await Promise.all(
				result.keys.map(async key => {
					const id = key.name.slice(prefix.length);
					const data = (await this._kv.get(key.name, { type: "json" })) as T[K] | null;
					if (data) return getItem(id, data);
				}),
			);
			for (const item of values) {
				if (item) items.push(item);
			}
			cursor = result.list_complete ? undefined : result.cursor;
		} while (cursor);
		return items;
	}
}
