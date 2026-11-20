# DeepMutable

- Kind: type
- Import: `import { DeepMutable } from "shelving/util/object";`

Deep mutable object: deeply convert an object to its mutable version.
- Any value that extends `UnknownObject` has its props made mutable.
- Works deeply on nested objects too.

## Signatures

```ts
{ -readonly [K in keyof T]: DeepMutable<T[K]> }
```

## Types

- [DeepMutable](DeepMutable.md): Deep mutable object: deeply convert an object to its mutable version.
- `K`
