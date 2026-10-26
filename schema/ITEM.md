# ITEM()

- Kind: function
- Import: `import { ITEM } from "shelving/schema";`

Create a `DataSchema` that validates a data item, i.e. it has a string or number `.id` identifier property.

Sugar factory for `DataSchema`.

## Signatures

```ts
ITEM(id: Schema<I>, schemas: Schemas<T> | DataSchema<T>): DataSchema<Item<I, T>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `id` | `Schema<I>` | Schema for the item's `id` identifier property. |
| `schemas` | `Schemas<T> \| DataSchema<T>` | The props schemas or an existing `DataSchema` for the rest of the item. |

## Returns

| Type | Description |
| --- | --- |
| `DataSchema<Item<I, T>>` |  |

## Examples

```ts
ITEM(NUMBER, { name: STRING }) // DataSchema<{ id: number; name: string }>
```
