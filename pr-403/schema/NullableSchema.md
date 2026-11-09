# NullableSchema

- Kind: class
- Import: `import { NullableSchema } from "shelving/schema";`
- Extends: `ThroughSchema<T | null>`

Schema that wraps a source schema and additionally allows `null`.

- Empty-ish inputs (`null`, `undefined`, `""`, `NaN`) validate to `null` instead of being passed to the source schema.
- Any other value is delegated to the source schema for validation.

Wraps another schema to allow `null` as a valid value. Following the robustness principle, `undefined` and the empty string `""` also coerce to `null`; any other value is delegated to the wrapped schema.

`NULLABLE(schema)` is the sugar factory that builds a `NullableSchema` around an existing schema.

## Usage

```ts
import { NULLABLE, NUMBER } from "shelving/schema";

const NULLABLE_NUMBER = NULLABLE(NUMBER);
NULLABLE_NUMBER.validate(null);       // null
NULLABLE_NUMBER.validate(undefined);  // null
NULLABLE_NUMBER.validate("");         // null
NULLABLE_NUMBER.validate(42);         // 42
```


## Signatures

```ts
new NullableSchema<T>({ value = null, ...options }: NullableSchemaOptions<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `NullableSchemaOptions<T>` |  |
| `.value` | `T \| null` | Default value used when the input is `undefined`. Read only. Defaults to `null`. |

## Returns

| Type | Description |
| --- | --- |
| `NullableSchema<T>` |  |
