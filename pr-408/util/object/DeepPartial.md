# DeepPartial

- Kind: type
- Import: `import { DeepPartial } from "shelving/util/object";`

Deep partial object: deeply convert an object to its partial version.
- Any value that extends `UnknownObject` has its props made partial.
- Works deeply on nested objects too.

## Signatures

```ts
{ [K in keyof T]?: DeepPartial<T[K]> }
```

## Types

- [DeepPartial](DeepPartial.md): Deep partial object: deeply convert an object to its partial version.
- `K`
