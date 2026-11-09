# Update

- Kind: type
- Import: `import { Update } from "shelving/util/update";`

A single decoded update to a keyed property in an object.

- Discriminated by `action`: `"set"`, `"with"` (add array items), `"omit"` (remove array items), or `"sum"` (add to a number).

## Signatures

```ts
| { action: "set"; key: Segments; value: unknown } //
	| { action: "with"; key: Segments; value: ImmutableArray<unknown> } //
	| { action: "omit"; key: Segments; value: ImmutableArray<unknown> } //
	| { action: "sum"; key: Segments; value: number }
```

## Types

- [Segments](../string/Segments.md): Series of string segments with at least one segment (this is what you actually get back when you split a string).
- [ImmutableArray](../array/ImmutableArray.md): Immutable array: an array that cannot be changed.
