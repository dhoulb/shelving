# REQUIRED()

- Kind: function
- Import: `import { REQUIRED } from "shelving/schema";`

Create a `RequiredSchema` that wraps a source schema and rejects a falsy result.

Sugar factory for `RequiredSchema`.

## Signatures

```ts
REQUIRED(source: Schema<T>): RequiredSchema<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `Schema<T>` | Source schema to wrap. |

## Returns

| Type | Description |
| --- | --- |
| `RequiredSchema<T>` |  |

## Examples

```ts
REQUIRED(STRING).validate(""); // Throws "Required"
```
