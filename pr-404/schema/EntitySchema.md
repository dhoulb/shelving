# EntitySchema

- Kind: class
- Import: `import { EntitySchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that validates an `Entity` string combining a type and ID, e.g. `challenge:a1b2c3`.

- The input must contain both a type and an ID separated by `:`, otherwise it is rejected.
- When `types` is set, the entity's type must be one of the allowed types.

## Signatures

```ts
new EntitySchema<T>({ one = "entity", title = "Entity", types, ...options }: EntitySchemaOptions<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `EntitySchemaOptions<T>` |  |
| `.types` | `ImmutableArray<T> \| undefined` | Restrict the allowed entity types; any other type is rejected. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `EntitySchema<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `types` | `ImmutableArray<T> \| undefined` | Read only. |

## Examples

```ts
const schema = new EntitySchema({ types: ["challenge"] });
 schema.validate("challenge:a1b2c3"); // "challenge:a1b2c3"
```
