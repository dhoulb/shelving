import { CollectionItemSchema } from "../../db/collection/CollectionItemSchema.js";
import { CollectionItemsSchema } from "../../db/collection/CollectionItemsSchema.js";
import { CollectionQueryItemsSchema } from "../../db/collection/CollectionQueryItemsSchema.js";
import type { MemoryDBProvider } from "../../db/provider/MemoryDBProvider.js";
import { DataSchema } from "../../schema/DataSchema.js";
import type { Schema } from "../../schema/Schema.js";
import { isArray } from "../../util/array.js";
import { isData } from "../../util/data.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Identifier, Item, Items } from "../../util/item.js";
import type { QueryItems } from "../../util/query.js";
import { getSource } from "../../util/source.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "./APIProvider.js";
import { ValidationAPIProvider } from "./ValidationAPIProvider.js";

/**
 * API provider that validates every result, then writes the collection items in it into a local database.
 *
 * - Only results that use a collection's own schemas hydrate: `Collection.item`, `Collection.items` and `Collection.queryItems`, or a `DataSchema` whose props use them (one level deep). Every other result passes through with no change.
 * - `Collection.item` sets the item. A `null` or `undefined` result (e.g. `NULLABLE(USERS.item)`) deletes the item with the `id` from the payload (the payload itself, or its `id` prop).
 * - `Collection.items` sets each item. It never deletes items.
 * - `Collection.queryItems` sets each item, then marks the query as loaded (see `MemoryTable.setQueryTime()`).
 * - Writes happen synchronously before `call()` resolves, so no store sees half of a result.
 * - Extends `ValidationAPIProvider`, so it only ever writes validated items.
 *
 * @see https://shelving.cc/api/HydratingAPIProvider
 */
export class HydratingAPIProvider<P, R> extends ValidationAPIProvider<P, R> {
	/**
	 * The local database the items are written into.
	 * @see https://shelving.cc/api/HydratingAPIProvider/db
	 */
	readonly db: MemoryDBProvider;

	constructor(source: APIProvider<P, R>, db: MemoryDBProvider) {
		super(source);
		this.db = db;
	}

	/** Calls the endpoint, then writes the collection items in the result into `db`. */
	override async call<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.call,
	): Promise<RR> {
		const result = await super.call(endpoint, payload, options, caller);
		const { db } = this;
		if (!_hydrate(db, endpoint.result, result, payload) && isData(result)) {
			// Go one level deep into a data result, so one endpoint can return several collections.
			const data = getSource(DataSchema, endpoint.result);
			if (data) for (const [k, schema] of Object.entries(data.props)) _hydrate(db, schema, result[k]);
		}
		return result;
	}
}

/** Write a value into the database if its schema is a collection schema, and return whether it was. */
function _hydrate(db: MemoryDBProvider, schema: Schema, value: unknown, payload?: unknown): boolean {
	const queryItems = getSource(CollectionQueryItemsSchema, schema);
	if (queryItems) {
		if (isData(value)) {
			const { query, items } = value as QueryItems;
			const table = db.getTable(queryItems.source);
			table.setItems(items);
			table.setQueryTime(query);
		}
		return true;
	}
	const items = getSource(CollectionItemsSchema, schema);
	if (items) {
		if (isArray(value)) db.getTable(items.source).setItems(value as Items);
		return true;
	}
	const item = getSource(CollectionItemSchema, schema);
	if (item) {
		const table = db.getTable(item.source);
		if (isData(value)) table.setItem((value as Item).id, value as Item);
		else if (value === null || value === undefined) {
			const id = _getPayloadID(payload);
			if (id !== undefined) table.deleteItem(id);
		}
		return true;
	}
	return false;
}

/** Get the item `id` from a payload: the payload itself, or its `id` prop. */
function _getPayloadID(payload: unknown): Identifier | undefined {
	const id = isData(payload) ? payload.id : payload;
	if (typeof id === "string" || typeof id === "number") return id;
}
