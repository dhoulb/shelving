# EntryKey

- Kind: type
- Import: `import { EntryKey } from "shelving/util/entry";`

Extract the key type from an `Entry`.

## Signatures

```ts
X extends Entry<infer Y, unknown> ? Y : never
```

## Types

- [Entry](Entry.md): Single key/value entry from a map-like object.
- `Y`
