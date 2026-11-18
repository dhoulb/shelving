# QUERY()

- Kind: function
- Import: `import { QUERY } from "shelving/schema";`

Create a `QuerySchema` for the data objects of a `DataSchema`.

Sugar factory for `QuerySchema`.

## Signatures

```ts
QUERY(data: DataSchema<T>): QuerySchema<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `DataSchema<T>` | Schema for the data objects the query filters and sorts. |

## Returns

| Type | Description |
| --- | --- |
| `QuerySchema<T>` |  |

## Examples

```ts
QUERY(DATA({ num: NUMBER })) // QuerySchema<{ num: number }>
```
