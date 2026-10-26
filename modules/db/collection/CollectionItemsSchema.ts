import { ArraySchema } from "../../schema/ArraySchema.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Sourceable } from "../../util/source.js";
import type { Collection } from "./Collection.js";

/**
 * Schema for a list of complete items (`id` + data) of a `Collection`.
 *
 * - Built by `Collection` as `Collection.items`. Use that instance, and do not make your own.
 * - Its `source` is the `Collection`, so `getSource()` can find the collection from the schema.
 * - `HydratingAPIProvider` writes an endpoint result that uses this schema into its database. It only adds and replaces items, and never deletes them.
 * - `ARRAY(USERS.item)` validates the same value, but it does not point at the collection, so it does not hydrate. Use `USERS.items`.
 *
 * @example
 *  const LIST_USERS = GET("/user", undefined, USERS.items);
 * @see https://shelving.cc/db/CollectionItemsSchema
 */
export class CollectionItemsSchema<I extends Identifier = Identifier, T extends Data = Data>
	extends ArraySchema<Item<I, T>>
	implements Sourceable<Collection<string, I, T>>
{
	/**
	 * The collection this schema validates items of.
	 * @see https://shelving.cc/db/CollectionItemsSchema/source
	 */
	readonly source: Collection<string, I, T>;

	constructor(collection: Collection<string, I, T>) {
		super({ items: collection.item });
		this.source = collection;
	}
}
