# NestedData

- Kind: type
- Import: `import { NestedData } from "shelving/util/data";`

Object with one level of data nested beneath each prop.
i.e. `{ A: { a: number }, B: { b: string } }`

## Signatures

```ts
{
	readonly [key: string]: Data;
}
```

## Types

- [Data](Data.md): Data object — a plain object with string keys and unknown values.
