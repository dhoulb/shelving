# PartialData

- Kind: type
- Import: `import { PartialData } from "shelving/util/data";`

Partial data object (values can be explicitly `undefined`).

## Signatures

```ts
{ readonly [K in keyof T]?: T[K] | undefined }
```

## Types

- `K`
