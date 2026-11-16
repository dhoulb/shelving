# isSchemaRequired()

- Kind: function
- Import: `import { isSchemaRequired } from "shelving/ui";`

Whether a schema is required, i.e. not wrapped in an `OptionalSchema` or `NullableSchema`.

## Signatures

```ts
isSchemaRequired(schema: Schema): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `schema` | `Schema` | The schema to test. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if the schema is required, `false` if it is optional or nullable. |

## Examples

```ts
isSchemaRequired(STRING) // true
```
