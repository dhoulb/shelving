# Query

- Kind: type
- Import: `import { Query } from "shelving/util/query";`

Query that can be applied to a list of data objects.

- Keys encode filters: `key` (is), `!key` (not), arrays for in/out, `key<`/`key<=`/`key>`/`key>=` for ranges, and `key[]` for array contains.
- `$order` sets the sort order (prefix `!` for descending) and `$limit` caps the number of results.

## Signatures

```ts
{
	readonly [K in LeafDataPath<T> as `${K}` | `!${K}`]?: LeafData<T>[K] | ImmutableArray<LeafData<T>[K]> | undefined; // is/not/in/out
} & {
	readonly [K in LeafDataPath<T> as `${K}<` | `${K}<=` | `${K}>` | `${K}>=`]?: LeafData<T>[K] | undefined; // gt/gte/lt/lte
} & {
	readonly [K in LeafDataPath<T> as `${K}[]`]?: LeafData<T>[K] extends ImmutableArray<infer X> ? X | undefined : never; // contains
} & {
	readonly $order?:
		| `${LeafDataPath<T>}`
		| `!${LeafDataPath<T>}`
		| undefined
		| ImmutableArray<`${LeafDataPath<T>}` | `!${LeafDataPath<T>}` | undefined>;
	readonly $limit?: number | undefined;
}
```

## Types

- [LeafDataPath](../data/LeafDataPath.md): Helper type to get the leaf paths for a flattened data object with deep paths flattened into a.c.b format.
- `K`
- [LeafData](../data/LeafData.md): Helper type to get a flattened data object with only leaf nodes of the data, flattened into a.c.b format. i.e. LeafData<{ a: { a2: number } }> produces { "a.a2": number }
- [ImmutableArray](../array/ImmutableArray.md): Immutable array: an array that cannot be changed.
- `X`
