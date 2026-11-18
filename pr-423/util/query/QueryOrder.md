# QueryOrder

- Kind: type
- Import: `import { QueryOrder } from "shelving/util/query";`

A single sort order that can be applied to a list of data objects.

## Signatures

```ts
{
	key: Segments;
	direction: "asc" | "desc";
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `key` | `Segments` |  |
| `direction` | `"asc" \| "desc"` |  |

## Types

- [Segments](../string/Segments.md): Series of string segments with at least one segment (this is what you actually get back when you split a string).
