# LeafDataProp

- Kind: type
- Import: `import { LeafDataProp } from "shelving/util/data";`

Helper type to get the leaf props for a flattened data object with deep paths flattened into `a.c.b` format.

## Signatures

```ts
{
	readonly [K in DataKey<T>]: (
		T[K] extends Data
			? LeafDataProp<T[K]> //
			: readonly [null, T[K]]
	) extends infer E
		? E extends readonly [infer KK, infer VV]
			? readonly [KK extends string ? `${K}.${KK}` : K, VV]
			: never
		: never;
}[DataKey<T>]
```

## Types

- [DataKey](DataKey.md): Helper type to get the key for a data object prop.
- `K`
- [Data](Data.md): Data object — a plain object with string keys and unknown values.
- [LeafDataProp](LeafDataProp.md): Helper type to get the leaf props for a flattened data object with deep paths flattened into a.c.b format.
- `E`
- `KK`
- `VV`
