import { DataSchema, ITEM } from "../../schema/DataSchema.js";
import { NumberSchema } from "../../schema/NumberSchema.js";
import type { Schema, Schemas } from "../../schema/Schema.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";

/** Default identifier schema (integer). */
export const ID = new NumberSchema({
	step: 1,
	min: Number.MIN_SAFE_INTEGER,
	max: Number.MAX_SAFE_INTEGER,
	value: 0,
	one: "ID",
	title: "ID",
});

/** Declarative definition of a database collection/table. */
export class Collection<K extends string, I extends Identifier, T extends Data> extends DataSchema<T> {
	/** Collection name (used as the table/collection key). */
	readonly name: K;

	/** Schema for the identifier type. */
	readonly id: Schema<I>;

	/** Schema for a complete item (id + data). */
	readonly item: DataSchema<Item<I, T>>;

	constructor(name: K, id: Schema<I>, data: Schemas<T> | DataSchema<T>) {
		const dataSchema = data instanceof DataSchema ? data : new DataSchema({ props: data });
		super({ ...dataSchema, props: dataSchema.props });
		this.name = name;
		this.id = id;
		this.item = ITEM(id, dataSchema);
	}
}

/** Shortcut factory for creating a Collection. */
export function COLLECTION<K extends string, I extends Identifier, T extends Data>(
	name: K,
	id: Schema<I>,
	data: Schemas<T> | DataSchema<T>,
): Collection<K, I, T> {
	return new Collection(name, id, data);
}

/** A readonly array of Collection instances, possibly with a standardised `Identifier`. */
export type Collections<I extends Identifier = Identifier> = ReadonlyArray<Collection<string, I, Data>>;

/** Extract the union of collection key strings from a Collections type. */
export type CollectionKeys<C extends Collections> = C[number]["name"];

/** Convert a Collections array type to a Database-style object mapping. */
export type CollectionsDatabase<C extends Collections> = {
	// biome-ignore lint/suspicious/noExplicitAny: Required for conditional type extraction.
	[E in C[number] as E extends Collection<infer K, any, any> ? K : never]: E extends Collection<string, any, infer T> ? T : never;
};
