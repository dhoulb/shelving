# EntryValue

- Kind: type
- Import: `import { EntryValue } from "shelving/util/entry";`

Extract the value type from an `Entry`.

## Signatures

```ts
X extends Entry<unknown, infer Y> ? Y : never
```

## Types

- [Entry](Entry.md): Single key/value entry from a map-like object.
- `Y`
