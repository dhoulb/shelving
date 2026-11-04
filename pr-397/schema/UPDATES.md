# UPDATES()

- Kind: function
- Import: `import { UPDATES } from "shelving/schema";`

Create an `UpdatesSchema` for the data object of a `DataSchema`.

Sugar factory for `UpdatesSchema`.

## Signatures

```ts
UPDATES(data: DataSchema<T>): UpdatesSchema<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `DataSchema<T>` | Schema for the data object the updates change. |

## Returns

| Type | Description |
| --- | --- |
| `UpdatesSchema<T>` |  |

## Examples

```ts
UPDATES(DATA({ num: NUMBER })) // UpdatesSchema<{ num: number }>
```
