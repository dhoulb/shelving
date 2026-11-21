# OmitProps

- Kind: type
- Import: `import { OmitProps } from "shelving/util/object";`

Omit the properties of an object that match a type.

## Signatures

```ts
Omit<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>
```

## Types

- `Omit`
- `K`
