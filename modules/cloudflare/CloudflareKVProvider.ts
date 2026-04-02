import type { Collection } from "../db/collection/Collection.js";
import { DBProvider } from "../db/provider/DBProvider.js";
import { UnimplementedError } from "../error/UnimplementedError.js";
import type { Data } from "../util/data.js";
import type { Items, OptionalItem } from "../util/item.js";
import { getItem } from "../util/item.js";
import type { ItemQuery } from "../util/query.js";
import type { Updates } from "../util/update.js";
import { randomUUID } from "../util/uuid.js";

/** Minimal interface matching Cloudflare Workers KV namespace runtime object. */
export interface KVNamespace {
	get(key: string, options: { type: "json" }): Promise<unknown>;
	put(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
}

/**
 * Cloudflare Workers KV database provider.
 *
 * Items are stored as JSON values under keys formatted as `collection:id`.
 * The `KVNamespace` object is provided by the Cloudflare Workers runtime environment.
 *
 * ### Supported
 * - Single item operations: `getItem`, `setItem`, `addItem`, `updateItem`, `deleteItem`.
 * - ID generation: `addItem()` generates a UUID v4 identifier automatically.
 *
 * ### Not supported
 * - **Realtime subscriptions:** `getItemSequence()` and `getQuerySequence()` throw `UnimplementedError`.
 *   KV has no change feed or push notification mechanism.
 * - **Updates:** `updateItem()` and `updateQuery()` throw `UnimplementedError`.
 * - **Collection queries:** `getQuery()`, `setQuery()`, `deleteQuery()`, and `countQuery()` are not supported.
 *   KV does not expose efficient filtering, sorting, or collection scans, so this provider avoids
 *   the old "read everything and filter in memory" behavior.
 *
 * ### Performance limitations
 * - **Single-key store only:** This provider is intentionally limited to direct key reads and writes.
 *   If you need collection queries, filtering, sorting, or bulk mutations, use a different backend.
 * - **Eventual consistency:** KV is eventually consistent, so reads may briefly return stale values
 *   shortly after writes.
 */
export class CloudflareKVProvider extends DBProvider<string> {
	private readonly _kv: KVNamespace;

	constructor(kv: KVNamespace) {
		super();
		this._kv = kv;
	}

	async getItem<T extends Data>({ name }: Collection<string, string, T>, id: string): Promise<OptionalItem<string, T>> {
		const data = (await this._kv.get(_getKey(name, id), { type: "json" })) as T | null;
		if (data) return getItem(id, data);
	}

	getItemSequence<T extends Data>(_c: Collection<string, string, T>, _id: string): AsyncIterable<OptionalItem<string, T>> {
		throw new UnimplementedError("CloudflareKVProvider does not support realtime subscriptions");
	}

	async addItem<T extends Data>({ name }: Collection<string, string, T>, data: T): Promise<string> {
		const id = randomUUID();
		await this._kv.put(_getKey(name, id), JSON.stringify(data));
		return id;
	}

	async setItem<T extends Data>({ name }: Collection<string, string, T>, id: string, data: T): Promise<void> {
		await this._kv.put(_getKey(name, id), JSON.stringify(data));
	}

	async updateItem<T extends Data>(_c: Collection<string, string, T>, _id: string, _updates: Updates<T>): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support updates to items");
	}

	async deleteItem<T extends Data>({ name }: Collection<string, string, T>, id: string): Promise<void> {
		await this._kv.delete(_getKey(name, id));
	}

	async getQuery<T extends Data>(_c: Collection<string, string, T>, _q?: ItemQuery<string, T>): Promise<Items<string, T>> {
		throw new UnimplementedError("CloudflareKVProvider does not support querying items");
	}

	getQuerySequence<T extends Data>(_c: Collection<string, string, T>, _q?: ItemQuery<string, T>): AsyncIterable<Items<string, T>> {
		throw new UnimplementedError("CloudflareKVProvider does not support realtime subscriptions");
	}

	async setQuery<T extends Data>(_c: Collection<string, string, T>, _q: ItemQuery<string, T>, _data: T): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support querying items");
	}

	async updateQuery<T extends Data>(_c: Collection<string, string, T>, _q: ItemQuery<string, T>, _updates: Updates<T>): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support updates to items");
	}

	async deleteQuery<T extends Data>(c: Collection<string, string, T>, _q: ItemQuery<string, T>): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support querying items");
	}
}

function _getKey(collection: string, id: string): string {
	return `${collection}:${id}`;
}
