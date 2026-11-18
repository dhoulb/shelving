# Transforms

- Kind: type
- Import: `import { Transforms } from "shelving/util/transform";`

Set of named transforms for a data object, keyed by prop name (or `undefined` to skip the transform for that prop).

## Signatures

```ts
{
	readonly [K in keyof I]?: (input: I[K], ...args: A) => O[K];
}
```

## Types

- `K`
