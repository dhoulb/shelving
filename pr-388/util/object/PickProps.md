# PickProps

- Kind: type
- Import: `import { PickProps } from "shelving/util/object";`

Pick only the properties of an object that match a type.

## Signatures

```ts
Pick<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>
```

## Types

- `Pick`
- `K`
