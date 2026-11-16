# QueryFilter

- Kind: type
- Import: `import { QueryFilter } from "shelving/util/query";`

A single filter that can be applied to a list of data objects.

- Discriminated by `operator`: `"is"`, `"not"`, `"in"`, `"out"`, `"contains"`, `"lt"`, `"lte"`, `"gt"`, or `"gte"`.

## Signatures

```ts
| { key: Segments; operator: "is"; value: unknown }
	| { key: Segments; operator: "not"; value: unknown }
	| { key: Segments; operator: "in"; value: ImmutableArray }
	| { key: Segments; operator: "out"; value: ImmutableArray }
	| { key: Segments; operator: "contains"; value: unknown }
	| { key: Segments; operator: "lt"; value: unknown }
	| { key: Segments; operator: "lte"; value: unknown }
	| { key: Segments; operator: "gt"; value: unknown }
	| { key: Segments; operator: "gte"; value: unknown }
```

## Types

- [Segments](../string/Segments.md): Series of string segments with at least one segment (this is what you actually get back when you split a string).
- [ImmutableArray](../array/ImmutableArray.md): Immutable array: an array that cannot be changed.
