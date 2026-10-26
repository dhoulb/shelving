import { DataSchema } from "../../schema/DataSchema.js";
import type { Data } from "../../util/data.js";
import type { Identifier } from "../../util/item.js";
import type { QueryItems } from "../../util/query.js";
import type { Sourceable } from "../../util/source.js";
import type { Collection } from "./Collection.js";

/**
 * Schema for `QueryItems` of a `Collection`, i.e. a query and the complete list of items that answer it.
 *
 * - Built by `Collection` as `Collection.queryItems`, from `Collection.query` and `Collection.items`. Use that instance, and do not make your own.
 * - The `query` is validated in full by `Collection.query`, and the `items` by `Collection.items`.
 * - Its `source` is the `Collection`, so `getSource()` can find the collection from the schema.
 * - `HydratingAPIProvider` writes an endpoint result that uses this schema into its database, and marks the query as loaded (see `MemoryTable.getQueryTime()`), so a store for the same query shows the items without loading.
 * - Only use it when `items` is the complete answer to `query` (with its `$limit`).
 *
 * @example
 *  const MY_CHALLENGES = GET("/challenge/me", undefined, DATA({ challenges: CHALLENGES.queryItems }));
 * @see https://shelving.cc/db/CollectionQueryItemsSchema
 */
export class CollectionQueryItemsSchema<I extends Identifier = Identifier, T extends Data = Data>
	extends DataSchema<QueryItems<I, T>>
	implements Sourceable<Collection<string, I, T>>
{
	/**
	 * The collection this schema validates items of.
	 * @see https://shelving.cc/db/CollectionQueryItemsSchema/source
	 */
	readonly source: Collection<string, I, T>;

	constructor(collection: Collection<string, I, T>) {
		super({ one: "result", title: "Result", props: { query: collection.query, items: collection.items } });
		this.source = collection;
	}
}
