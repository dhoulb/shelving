# updateData()

- Kind: function
- Import: `import { updateData } from "shelving/util/update";`

Return a copy of a data object with a set of updates applied.

- Returns the original reference unchanged when no update changed a value.
- Supports nested paths, sum/increment, and array add/remove updates via the encoded `Updates` syntax.

## Signatures

```ts
updateData(data: T, updates: Updates<T>): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `T` | The data object to update. |
| `updates` | `Updates<T>` | The set of updates to apply. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The updated data object (or the original reference if nothing changed). |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if a `+=`/`-=` sum update has a non-number value. |
