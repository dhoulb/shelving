# EntryObject

- Kind: type
- Import: `import { EntryObject } from "shelving/util/entry";`

Turn an `Entry` type back into an object with a single property.
i.e. `EntryObject<Entry<"a", string>>` produces `{ a: string }`

## Signatures

```ts
{ readonly [E in T as E[0]]: E[1] }
```

## Types

- `E`
