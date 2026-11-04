# ThroughSchema

- Kind: class
- Import: `import { ThroughSchema } from "shelving/schema";`
- Extends: `Schema<T>`
- Implements: `Sourceable<Schema<T>>`

Schema that wraps and passes through to a source schema, used as a base for schemas that augment another schema's behaviour (e.g. `NullableSchema`, `OptionalSchema`, `RequiredSchema`).

## Signatures

```ts
new ThroughSchema<T>({ source, ...options }: ThroughSchemaOptions<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `ThroughSchemaOptions<T>` |  |
| `.source` | `Schema<T>` | The source schema this schema passes through to. |

## Returns

| Type | Description |
| --- | --- |
| `ThroughSchema<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `source` | `Schema<T>` | The source schema this schema passes through to. Read only. |

## Examples

```ts
class WrapSchema<T> extends ThroughSchema<T> {} // Delegates `validate()` to `this.source`.
```

## Methods

- [ThroughSchema.validate()](ThroughSchema/validate.md): Validate an unknown input value by passing it through to the source schema.
