# OPTIONAL()

- Kind: function
- Import: `import { OPTIONAL } from "shelving/schema";`

Create an `OptionalSchema` that wraps a source schema and also allows `undefined`.

Sugar factory for `OptionalSchema`.

## Signatures

```ts
OPTIONAL(source: Schema<T>): OptionalSchema<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `Schema<T>` | Source schema to wrap. |

## Returns

| Type | Description |
| --- | --- |
| `OptionalSchema<T>` |  |

## Examples

```ts
OPTIONAL(STRING).validate(undefined); // Returns undefined
```
