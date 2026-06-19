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
 *
 * @example
 * // `env.KV` is the KV namespace binding from the Worker environment.
 * const provider = new CloudflareKVProvider(env.KV);
 *
 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider
 */
export class CloudflareKVProvider<I extends string = string, T extends Data = Data> extends DBProvider<I, T> {
	private readonly _kv: KVNamespace;

	/**
	 * Create a provider wrapping a Cloudflare Workers KV namespace binding.
	 *
	 * @param kv The `KVNamespace` binding from the Worker environment.
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider
	 */
	constructor(kv: KVNamespace) {
		super();
		this._kv = kv;
	}

	/**
	 * Read a single item by ID from the KV namespace.
	 *
	 * @param collection The collection the item belongs to (only its `name` is used to form the key).
	 * @param id The ID of the item to read.
	 * @returns Promise resolving to the item, or `undefined` if no value exists for the key.
	 * @example await provider.getItem(users, "abc123")
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/getItem
	 */
	override async getItem<II extends I, TT extends T>({ name }: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const data = (await this._kv.get(_getKey(name, id), { type: "json" })) as TT | null; // `as TT` needed: KV returns unknown from JSON parse.
		if (data) return getItem(id, data);
	}

	/**
	 * Not supported — KV has no change feed or push notification mechanism.
	 *
	 * @param collection The collection the item belongs to.
	 * @param id The ID of the item to subscribe to.
	 * @returns Never returns normally.
	 * @throws {UnimplementedError} Always, because KV does not support realtime subscriptions.
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/getItemSequence
	 */
	override getItemSequence<II extends I, TT extends T>(_collection: Collection<string, II, TT>, _id: II): OptionalItemSequence<II, TT> {
		throw new UnimplementedError("CloudflareKVProvider does not support realtime subscriptions");
	}

	/**
	 * Add an item with an automatically generated UUID v4 identifier.
	 *
	 * @param collection The collection to add the item to (only its `name` is used to form the key).
	 * @param data The data for the new item.
	 * @returns Promise resolving to the generated ID of the new item.
	 * @example const id = await provider.addItem(users, { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>({ name }: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = randomUUID() as II; // `as II` needed: TypeScript can't narrow II from string return type.
		await this._kv.put(_getKey(name, id), JSON.stringify(data));
		return id;
	}

	/**
	 * Write an item by ID, overwriting any existing value.
	 *
	 * @param collection The collection the item belongs to (only its `name` is used to form the key).
	 * @param id The ID of the item to write.
	 * @param data The data to store for the item.
	 * @returns Promise resolving once the write completes.
	 * @example await provider.setItem(users, "abc123", { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/setItem
	 */
	override async setItem<II extends I, TT extends T>({ name }: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await this._kv.put(_getKey(name, id), JSON.stringify(data));
	}

	/**
	 * Not supported — KV cannot apply partial updates atomically.
	 *
	 * @param collection The collection the item belongs to.
	 * @param id The ID of the item to update.
	 * @param updates The updates to apply.
	 * @returns Never returns normally.
	 * @throws {UnimplementedError} Always, because KV does not support item updates.
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/updateItem
	 */
	override async updateItem<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_id: II,
		_updates: Updates<Item<II, TT>>,
	): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support updates to items");
	}

	/**
	 * Delete an item by ID from the KV namespace.
	 *
	 * @param collection The collection the item belongs to (only its `name` is used to form the key).
	 * @param id The ID of the item to delete.
	 * @returns Promise resolving once the deletion completes.
	 * @example await provider.deleteItem(users, "abc123")
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/deleteItem
	 */
	override async deleteItem<II extends I, TT extends T>({ name }: Collection<string, II, TT>, id: II): Promise<void> {
		await this._kv.delete(_getKey(name, id));
	}

	/**
	 * Not supported — KV cannot efficiently filter, sort, or scan collections.
	 *
	 * @param collection The collection to query.
	 * @param query The query to run.
	 * @returns Never returns normally.
	 * @throws {UnimplementedError} Always, because KV does not support collection queries.
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/getQuery
	 */
	override async getQuery<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		throw new UnimplementedError("CloudflareKVProvider does not support querying items");
	}

	/**
	 * Not supported — KV has no change feed and cannot run collection queries.
	 *
	 * @param collection The collection to query.
	 * @param query The query to subscribe to.
	 * @returns Never returns normally.
	 * @throws {UnimplementedError} Always, because KV does not support realtime subscriptions.
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/getQuerySequence
	 */
	override getQuerySequence<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		throw new UnimplementedError("CloudflareKVProvider does not support realtime subscriptions");
	}

	/**
	 * Not supported — KV cannot run the collection query needed to target matching items.
	 *
	 * @param collection The collection to query.
	 * @param query The query selecting items to write.
	 * @param data The data to write to each matching item.
	 * @returns Never returns normally.
	 * @throws {UnimplementedError} Always, because KV does not support collection queries.
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/setQuery
	 */
	override async setQuery<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query: Query<Item<II, TT>>,
		_data: TT,
	): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support querying items");
	}

	/**
	 * Not supported — KV supports neither updates nor collection queries.
	 *
	 * @param collection The collection to query.
	 * @param query The query selecting items to update.
	 * @param updates The updates to apply to each matching item.
	 * @returns Never returns normally.
	 * @throws {UnimplementedError} Always, because KV does not support item updates.
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/updateQuery
	 */
	override async updateQuery<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query: Query<Item<II, TT>>,
		_updates: Updates<TT>,
	): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support updates to items");
	}

	/**
	 * Not supported — KV cannot run the collection query needed to target matching items.
	 *
	 * @param collection The collection to query.
	 * @param query The query selecting items to delete.
	 * @returns Never returns normally.
	 * @throws {UnimplementedError} Always, because KV does not support collection queries.
	 * @see https://dhoulb.github.io/shelving/cloudflare/CloudflareKVProvider/CloudflareKVProvider/deleteQuery
	 */
	override async deleteQuery<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query: Query<Item<II, TT>>,
	): Promise<void> {
		throw new UnimplementedError("CloudflareKVProvider does not support querying items");
	}
}

function _getKey(collection: string, id: string): string {
	return `${collection}:${id}`;
}
