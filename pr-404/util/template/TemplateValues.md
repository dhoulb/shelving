# TemplateValues

- Kind: type
- Import: `import { TemplateValues } from "shelving/util/template";`

Things that can be converted to the value for a named placeholder.

`PossibleString` — Single string used for every `{placeholder}`
`ImmutableArray<string>` — Array of strings (or functions that return strings) used for `*` numbered placeholders e.g. `["John"]`
`ImmutableDictionary<PossibleString>` — Object containing named strings used for named placeholders, e.g. `{ val1: "Ellie", val2: 123 }`
`(placeholder: string) => string` — Function that returns the right string for a named `{placeholder}`.

## Signatures

```ts
PossibleString | ImmutableArray<unknown> | ImmutableDictionary<unknown> | ((placeholder: string) => string)
```

## Types

- [PossibleString](../string/PossibleString.md): Things that can be reliably converted to a string with no confusion.
- [ImmutableArray](../array/ImmutableArray.md): Immutable array: an array that cannot be changed.
- [ImmutableDictionary](../dictionary/ImmutableDictionary.md): Readonly dictionary object.
