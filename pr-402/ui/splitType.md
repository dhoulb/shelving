# splitType()

- Kind: function
- Import: `import { splitType } from "shelving/ui";`

Split a type expression on ` | ` into its individual union members.
- An `undefined` member is dropped from display and instead flags the value as optional — we often write `| undefined` explicitly (e.g. for `exactOptionalPropertyTypes`, or to allow an explicit `undefined` to trigger a default), which reads as noise in the docs.
- When nothing but `undefined` is left, the members are kept as-is rather than emptied.

## Signatures

```ts
splitType(type: string): { readonly members: readonly string[]; readonly optional: boolean }
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `type` | `string` | The type expression to split (e.g. `"Schemas<T> \| DataSchema<T>"`). |

## Returns

| Type | Description |
| --- | --- |
| `{ readonly members: readonly string[]; readonly optional: boolean }` | The non-`undefined` members, plus whether an `undefined` member was dropped. |
