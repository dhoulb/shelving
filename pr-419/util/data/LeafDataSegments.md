# LeafDataSegments

- Kind: type
- Import: `import { LeafDataSegments } from "shelving/util/data";`

Typed path tuple for only leaf nodes of a data object.
i.e. `LeafPath<{ a: number, b: { c: string } }>` produces `readonly ["a"] | readonly ["b", "c"]`

## Signatures

```ts
{
	readonly [K in DataKey<T>]: T[K] extends Data ? readonly [K, ...LeafDataSegments<T[K]>] : readonly [K];
}[DataKey<T>]
```

## Types

- [DataKey](DataKey.md): Helper type to get the key for a data object prop.
- `K`
- [Data](Data.md): Data object — a plain object with string keys and unknown values.
- [LeafDataSegments](LeafDataSegments.md): Typed path tuple for only leaf nodes of a data object. i.e. LeafPath<{ a: number, b: { c: string } }> produces readonly ["a"] | readonly ["b", "c"]
