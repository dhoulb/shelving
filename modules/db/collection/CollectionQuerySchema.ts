import { QuerySchema } from "../../schema/QuerySchema.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Sourceable } from "../../util/source.js";
import type { Collection } from "./Collection.js";

/**
 * Schema for a `Query` on the items of a `Collection`.
 *
 * - Built by `Collection` as `Collection.query`. Use that instance, and do not make your own.
 * - Validates the query in full against `Collection.item` (see `QuerySchema`), so a query from outside (e.g. an API request or response) can be trusted. Filter and `$order` keys can use `id` and any prop path of the collection.
 * - Its `source` is the `Collection`, so `getSource()` can find the collection from the schema.
 *
 * @see https://shelving.cc/db/CollectionQuerySchema
 */
export class CollectionQuerySchema<I extends Identifier = Identifier, T extends Data = Data>
	extends QuerySchema<Item<I, T>>
	implements Sourceable<Collection<string, I, T>>
{
	/**
	 * The collection this schema validates queries for.
	 * @see https://shelving.cc/db/CollectionQuerySchema/source
	 */
	readonly source: Collection<string, I, T>;

	constructor(collection: Collection<string, I, T>) {
		super({ data: collection.item });
		this.source = collection;
	}
}
