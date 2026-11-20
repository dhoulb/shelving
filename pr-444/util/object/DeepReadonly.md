# DeepReadonly

- Kind: type
- Import: `import { DeepReadonly } from "shelving/util/object";`

Deep readonly object: deeply convert an object to its readonly version.
- Any value that extends `UnknownObject` has its props made readonly.
- Works deeply on nested objects too.

## Signatures

```ts
{ +readonly [K in keyof T]: DeepReadonly<T[K]> }
```

## Types

- [DeepReadonly](DeepReadonly.md): Deep readonly object: deeply convert an object to its readonly version.
- `K`
