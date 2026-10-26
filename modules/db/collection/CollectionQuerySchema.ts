import { Schema } from "../../schema/Schema.js";
import type { Data } from "../../util/data.js";
import { isData } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Sourceable } from "../../util/source.js";
import type { Collection } from "./Collection.js";

/**
 * Schema for a `Query` on the items of a `Collection`.
 *
 * - Built by `Collection` as `Collection.query`. Use that instance, and do not make your own.
 * - **Do not trust a query that this schema validates.** It only checks that the value is an object. It does not check the keys or the values against the collection, so a query from outside (e.g. an API response) can have any keys and values.
 * - Its `source` is the `Collection`, so `getSource()` can find the collection from the schema.
 *
 * @see https://shelving.cc/db/CollectionQuerySchema
 */
export class CollectionQuerySchema<I extends Identifier = Identifier, T extends Data = Data>
	extends Schema<Query<Item<I, T>>>
	implements Sourceable<Collection<string, I, T>>
{
	/**
	 * The collection this schema validates queries for.
	 * @see https://shelving.cc/db/CollectionQuerySchema/source
	 */
	readonly source: Collection<string, I, T>;

	constructor(collection: Collection<string, I, T>) {
		super({ one: "query", title: "Query", value: {} });
		this.source = collection;
	}

	/** Checks that the value is an object, and does nothing more. Do not trust the result. */
	override validate(unsafeValue: unknown = this.value): Query<Item<I, T>> {
		if (!isData(unsafeValue)) throw "Must be object";
		return unsafeValue as Query<Item<I, T>>;
	}
}
