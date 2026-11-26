# QueryNearest

- Kind: type
- Import: `import { QueryNearest } from "shelving/util/query";`

A "nearest" sort that can be applied to a list of data objects: the items whose vector at `key` has the highest dot product with `value` come first.

## Signatures

```ts
{
	key: Segments;
	value: VectorArray;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `key` | `Segments` |  |
| `value` | `VectorArray` |  |

## Types

- [Segments](../string/Segments.md): Series of string segments with at least one segment (this is what you actually get back when you split a string).
- [VectorArray](../vector/VectorArray.md): A vector of numbers, for example a text embedding, stored as a Float32Array.
