# getSourceSchema()

- Kind: function
- Import: `import { getSourceSchema } from "shelving/schema";`

Get the innermost source of a wrapper schema, or the schema itself if it is not a `ThroughSchema`.

- Unlike `getSource()`, it only goes through `ThroughSchema` wrappers (e.g. `NullableSchema`, `OptionalSchema`), so it never leaves the schema for another kind of source.

## Signatures

```ts
getSourceSchema(schema: Schema<unknown>): Schema<unknown>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `schema` | `Schema<unknown>` | The schema to unwrap. |

## Returns

| Type | Description |
| --- | --- |
| `Schema<unknown>` | The innermost schema that is not a `ThroughSchema`. |

## Examples

```ts
getSourceSchema(OPTIONAL(NULLABLE(NUMBER))) // NUMBER
```
