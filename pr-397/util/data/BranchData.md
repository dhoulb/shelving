# BranchData

- Kind: type
- Import: `import { BranchData } from "shelving/util/data";`

Helper type to get a flattened data object with every branch node of the data, flattened into `a.c.b` format.
i.e. `BranchData<{ a: { a2: number } }>` produces `{ "a": object, "a.a2": number }`

## Signatures

```ts
EntryObject<BranchDataProp<T>>
```

## Types

- [EntryObject](../entry/EntryObject.md): Turn an Entry type back into an object with a single property. i.e. EntryObject<Entry<"a", string>> produces { a: string }
- [BranchDataProp](BranchDataProp.md): Helper type to get the prop for a flattened data object with deep paths flattened into a.c.b format.
