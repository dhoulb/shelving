# deleteProp

- Kind: constant
- Import: `import { deleteProp } from "shelving/util/object";`

Remove a key/value entry from an object (by reference).

## Signatures

```ts
deleteProp: <T extends MutableObject>(input: T, key: Key<T>) => void
```
