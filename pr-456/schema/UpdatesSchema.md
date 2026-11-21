# UpdatesSchema

- Kind: class
- Import: `import { UpdatesSchema } from "shelving/schema";`
- Extends: `Schema<Updates<T>>`

Schema that validates an `Updates` object against the schema of the data object it changes.

- Each key, without its update prefix, is a prop path of `data` (e.g. `sub.num`). `getDataSchemaProp()` finds the schema for the path.
- A set update (`a`, `a.b`, `=a.b`) is validated in full against the schema at its path. A set on `a` replaces all of `a`, so it is not partial.
- A sum update (`+=a`, `-=a`) needs a `NumberSchema` prop and a number value.
- A with or omit update (`+[]a`, `-[]a`) needs an `ArraySchema` prop. Each item is validated against `ArraySchema.items`.
- An unknown key throws. `undefined` values are removed.

## Signatures

```ts
new UpdatesSchema<T>({ data, one = "update", title = "Updates", value = {}, ...options }: UpdatesSchemaOptions<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `UpdatesSchemaOptions<T>` |  |
| `.data` | `DataSchema<T>` | Schema for the data object the updates change. Read only. |

## Returns

| Type | Description |
| --- | --- |
| `UpdatesSchema<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `data` | `DataSchema<T>` | Read only. |

## Examples

```ts
const schema = new UpdatesSchema({ data: DATA({ num: NUMBER, sub: DATA({ str: STRING }) }) });
 schema.validate({ "+=num": 1, "sub.str": "abc" }); // { "+=num": 1, "sub.str": "abc" }
```
