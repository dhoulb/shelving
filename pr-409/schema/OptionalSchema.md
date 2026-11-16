# OptionalSchema

- Kind: class
- Import: `import { OptionalSchema } from "shelving/schema";`
- Extends: `ThroughSchema<T | undefined>`

Schema that wraps a source schema and additionally allows `undefined`.

- `undefined` input validates to `undefined` instead of being passed to the source schema.
- When used with `validateData()` this means the prop can be silently skipped.
- Any other value is delegated to the source schema for validation.

Wraps another schema to allow `undefined` as a valid value. Any value other than `undefined` is delegated to the wrapped schema. It is mainly used for partial data props.

`OPTIONAL(schema)` is the sugar factory that builds an `OptionalSchema` around an existing schema.

## Usage

```ts
import { OPTIONAL, NUMBER } from "shelving/schema";

const OPTIONAL_NUMBER = OPTIONAL(NUMBER);
OPTIONAL_NUMBER.validate(undefined); // undefined
OPTIONAL_NUMBER.validate(42);        // 42
```


## Signatures

```ts
new OptionalSchema<T>(options: OptionalSchemaOptions<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `OptionalSchemaOptions<T>` |  |
| `.value` | `undefined` | Default value is always `undefined` (the default is only used when the input is `undefined`, so otherwise `undefined` could never be returned). Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `OptionalSchema<T>` |  |
