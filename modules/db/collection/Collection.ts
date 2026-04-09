import { DataSchema, ITEM } from "../../schema/DataSchema.js";
import { NumberSchema } from "../../schema/NumberSchema.js";
import type { Schema, Schemas } from "../../schema/Schema.js";
import type { ImmutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";

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
export class Collection<N extends string, I extends Identifier, T extends Data> extends DataSchema<T> {
	/** Collection name (used as the table/collection key). */
	readonly name: N;

	/** Schema for the identifier type. */
	readonly id: Schema<I>;

	/** Schema for a complete item (id + data). */
	readonly item: DataSchema<Item<I, T>>;

	constructor(name: N, id: Schema<I>, data: Schemas<T> | DataSchema<T>) {
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

/** Any collection object, possibly with a standardised `Identifier` and `Data` types. */
export type AnyCollection<I extends Identifier = Identifier, D extends Data = Data> = Collection<string, I, D>;

/** Extract the string name from a `Collection` instance. */
export type CollectionName<C extends AnyCollection> = C extends Collection<infer N, infer _I, infer _T> ? N : never;

/** Extract the `Identifier` type from a `Collection` instance. */
export type CollectionIdentifier<C extends AnyCollection> = C extends Collection<infer _N, infer I, infer _T> ? I : never;

/** Extract the `Data` type from a `Collection` instance. */
export type CollectionData<C extends AnyCollection> = C extends Collection<infer _N, infer _I, infer T> ? T : never;

/** Extract the `Item` type from a `Collection` instance. */
export type CollectionItem<C extends AnyCollection> = Item<CollectionIdentifier<C>, CollectionData<C>>;

/** Extract the optional (possibly undefined) `Item` type from a `Collection` instance. */
export type OptionalCollectionItem<C extends AnyCollection> = OptionalItem<CollectionIdentifier<C>, CollectionData<C>>;

/** Extract the array of `Item` types from a `Collection` instance. */
export type CollectionItems<C extends AnyCollection> = Items<CollectionIdentifier<C>, CollectionData<C>>;

/** A readonly array of Collection instances, possibly with a standardised `Identifier` and `Data` types. */
export type Collections<I extends Identifier = Identifier, D extends Data = Data> = ImmutableArray<AnyCollection<I, D>>;

/** Extract the union of string collection names from a `Collections` type. */
export type CollectionNames<C extends Collections> = C[number]["name"];

/** Convert a `Collections` array type to a Database-style object mapping in `{ name: data }` format. */
export type CollectionsDatabase<C extends Collections> = {
	[E in C[number] as E extends Collection<infer N, Identifier, Data> ? N : never]: E extends Collection<string, Identifier, infer T>
		? T
		: never;
};
