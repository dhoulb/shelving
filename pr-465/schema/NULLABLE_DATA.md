# NULLABLE_DATA()

- Kind: function
- Import: `import { NULLABLE_DATA } from "shelving/schema";`

Create a schema for a valid data object with specified properties, or `null`.

Sugar factory for `NullableSchema`.

## Signatures

```ts
NULLABLE_DATA(props: Schemas<T>): NullableSchema<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `Schemas<T>` | A named schema for each property of the data object. |

## Returns

| Type | Description |
| --- | --- |
| `NullableSchema<T>` |  |

## Examples

```ts
NULLABLE_DATA({ name: STRING }) // NullableSchema<{ name: string }>
```
