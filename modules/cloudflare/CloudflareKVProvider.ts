import type { Collection } from "../db/collection/Collection.js";
import { DBProvider } from "../db/provider/DBProvider.js";
import { UnimplementedError } from "../error/UnimplementedError.js";
import type { Data } from "../util/data.js";
import { getItem, type Item, type Items, type ItemsSequence, type OptionalItem, type OptionalItemSequence } from "../util/item.js";
import type { Query } from "../util/query.js";
import type { Updates } from "../util/update.js";
import { randomUUID } from "../util/uuid.js";
import type { KVNamespace } from "./types.js";

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
 *   KV does not expose efficient filtering, sorting, or collection scans, so this provider avoids the old "read everything and filter in memory" behavior.
 *
 * ### Performance limitations
 * - **Single-key store only:** This provider is intentionally limited to direct key reads and writes.
 *   If you need collection queries, filtering, sorting, or bulk mutations, use a different backend.
 * - **Eventual consistency:** KV is eventually consistent, so reads may briefly return stale values shortly after writes.
 */
export class CloudflareKVProvider<I extends string = string, T extends Data = Data> extends DBProvider<I, T> {
	private readonly _kv: KVNamespace;

	constructor(kv: KVNamespace) {
		super();
		this._kv = kv;
	}

	async getItem<II extends I, TT extends T>({ name }: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const data = (await this._kv.get(_getKey(name, id), { type: "json" })) as TT | null; // `as TT` needed: KV returns unknown from JSON parse.
		if (data) return getItem(id, data);
	}

	getItemSequence<II extends I, TT extends T>(_collection: Collection<string, II, TT>, _id: II): OptionalItemSequence<II, TT> {
		throw new UnimplementedError("CloudflareKVProvider does not support realtime subscriptions");
	}

	async addItem<II extends I, TT extends T>({ name }: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = randomUUID() as II; // `as II` needed: TypeScript can't narrow II from string return type.
		await this._kv.put(_getKey(name, id), JSON.stringify(data));
		return id;
	}

	async setItem<II extends I, TT extends T>({ name }: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await this._kv.put(_getKey(name, id), JSON.stringify(data));
	}

	async updateItem<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_id: II,
		_updates: Updates<Item<II, TT>>,
	): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support updates to items");
	}

	async deleteItem<II extends I, TT extends T>({ name }: Collection<string, II, TT>, id: II): Promise<void> {
		await this._kv.delete(_getKey(name, id));
	}

	async getQuery<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		throw new UnimplementedError("CloudflareKVProvider does not support querying items");
	}

	getQuerySequence<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		throw new UnimplementedError("CloudflareKVProvider does not support realtime subscriptions");
	}

	async setQuery<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query: Query<Item<II, TT>>,
		_data: TT,
	): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support querying items");
	}

	async updateQuery<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query: Query<Item<II, TT>>,
		_updates: Updates<TT>,
	): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support updates to items");
	}

	async deleteQuery<II extends I, TT extends T>(_collection: Collection<string, II, TT>, _query: Query<Item<II, TT>>): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support querying items");
	}
}

function _getKey(collection: string, id: string): string {
	return `${collection}:${id}`;
}
