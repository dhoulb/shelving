# NULLABLE()

- Kind: function
- Import: `import { NULLABLE } from "shelving/schema";`

Create a `NullableSchema` that wraps a source schema and also allows `null`.

Sugar factory for `NullableSchema`.

## Signatures

```ts
NULLABLE(source: Schema<T>): NullableSchema<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `Schema<T>` | Source schema to wrap. |

## Returns

| Type | Description |
| --- | --- |
| `NullableSchema<T>` |  |

## Examples

```ts
NULLABLE(STRING).validate(""); // Returns null
```
