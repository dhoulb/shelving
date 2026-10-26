import { DataSchema } from "../../schema/DataSchema.js";
import type { Schemas } from "../../schema/Schema.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Sourceable } from "../../util/source.js";
import type { Collection } from "./Collection.js";

/**
 * Schema for one complete item (`id` + data) of a `Collection`.
 *
 * - Built by `Collection` as `Collection.item`. Use that instance, and do not make your own.
 * - Its `source` is the `Collection`, so `getSource()` can find the collection from the schema (e.g. through `NULLABLE(USERS.item)`).
 * - `HydratingAPIProvider` writes an endpoint result that uses this schema into its database. A `null` or `undefined` result deletes the item with the `id` from the payload.
 *
 * @example
 *  const GET_USER = GET("/user/{id}", DATA({ id: USERS.id }), NULLABLE(USERS.item));
 * @see https://shelving.cc/db/CollectionItemSchema
 */
export class CollectionItemSchema<I extends Identifier = Identifier, T extends Data = Data>
	extends DataSchema<Item<I, T>>
	implements Sourceable<Collection<string, I, T>>
{
	/**
	 * The collection this schema validates items of.
	 * @see https://shelving.cc/db/CollectionItemSchema/source
	 */
	readonly source: Collection<string, I, T>;

	constructor(collection: Collection<string, I, T>) {
		super({ props: { id: collection.id, ...collection.props } as Schemas<Item<I, T>> });
		this.source = collection;
	}
}
