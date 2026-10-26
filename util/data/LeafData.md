# LeafData

- Kind: type
- Import: `import { LeafData } from "shelving/util/data";`

Helper type to get a flattened data object with only leaf nodes of the data, flattened into `a.c.b` format.
i.e. `LeafData<{ a: { a2: number } }>` produces `{ "a.a2": number }`

## Signatures

```ts
EntryObject<LeafDataProp<T>>
```

## Types

- [EntryObject](../entry/EntryObject.md): Turn an Entry type back into an object with a single property. i.e. EntryObject<Entry<"a", string>> produces { a: string }
- [LeafDataProp](LeafDataProp.md): Helper type to get the leaf props for a flattened data object with deep paths flattened into a.c.b format.
