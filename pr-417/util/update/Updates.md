# Updates

- Kind: type
- Import: `import { Updates } from "shelving/util/update";`

Set of named updates for a data object, keyed by encoded update syntax.

- Plain key `a.b` sets a value, `=a.b` sets a leaf value, `+=`/`-=` sum numbers, and `+[]`/`-[]` add/remove array items.

Note: string templates infer best when you have fixed character(s) at the start,
  so the `=`/`+=`/`-=`/`+[]`/`-[]` prefixes always lead the key.

## Signatures

```ts
{
	/**
	 * Set update (all branches)
	 * - Can set `a` and `a.a1` in `{ a: { a1: 123 } }`
	 * - Sometimes inference gets confused, if that happens use `=` syntax instead.
	 */
	readonly [K in BranchDataPath<T> as `${K}`]?: BranchData<T>[K] | undefined;
} & {
	/**
	 * Set update (leaves only)
	 * - Can set `a.a1` in `{ a: { a1: 123 } }`, but cannot set `a`
	 * - Deeply-nested properties don't always infer when leaves and branches are combined.
	 * - This syntax is more exact and will infer better.
	 */
	readonly [K in LeafDataPath<T> as `=${K}`]?: LeafData<T>[K] | undefined;
} & {
	/**
	 * Sum update.
	 * - Increment/decrement numbers.
	 */
	readonly [K in LeafDataPath<T> as `+=${K}` | `-=${K}`]?: LeafData<T>[K] extends number ? LeafData<T>[K] | undefined : never;
} & {
	/**
	 * With/omit update.
	 * - Add or remove items from arrays.
	 */
	readonly [K in LeafDataPath<T> as `+[]${K}` | `-[]${K}`]?: LeafData<T>[K] extends ImmutableArray<unknown>
		? LeafData<T>[K] | LeafData<T>[K][number] | undefined
		: never;
}
```

## Types

- [BranchDataPath](../data/BranchDataPath.md): Helper type to get the path for a flattened data object with deep paths flattened into a.c.b format.
- `K`
- [BranchData](../data/BranchData.md): Helper type to get a flattened data object with every branch node of the data, flattened into a.c.b format. i.e. BranchData<{ a: { a2: number } }> produces { "a": object, "a.a2": number }
- [LeafDataPath](../data/LeafDataPath.md): Helper type to get the leaf paths for a flattened data object with deep paths flattened into a.c.b format.
- [LeafData](../data/LeafData.md): Helper type to get a flattened data object with only leaf nodes of the data, flattened into a.c.b format. i.e. LeafData<{ a: { a2: number } }> produces { "a.a2": number }
- [ImmutableArray](../array/ImmutableArray.md): Immutable array: an array that cannot be changed.
