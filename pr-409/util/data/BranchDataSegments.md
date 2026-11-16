# BranchDataSegments

- Kind: type
- Import: `import { BranchDataSegments } from "shelving/util/data";`

Typed path tuple for every branch node of a data object (including intermediate objects).
i.e. `BranchPath<{ a: number, b: { c: string } }>` produces `readonly ["a"] | readonly ["b"] | readonly ["b", "c"]`

## Signatures

```ts
{
	readonly [K in DataKey<T>]: T[K] extends Data ? readonly [K] | readonly [K, ...BranchDataSegments<T[K]>] : readonly [K];
}[DataKey<T>]
```

## Types

- [DataKey](DataKey.md): Helper type to get the key for a data object prop.
- `K`
- [Data](Data.md): Data object — a plain object with string keys and unknown values.
- [BranchDataSegments](BranchDataSegments.md): Typed path tuple for every branch node of a data object (including intermediate objects). i.e. BranchPath<{ a: number, b: { c: string } }> produces readonly ["a"] | readonly ["b"] | readonly ["b", "c"]
