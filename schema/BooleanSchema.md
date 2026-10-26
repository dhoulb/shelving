# BooleanSchema

- Kind: class
- Import: `import { BooleanSchema } from "shelving/schema";`
- Extends: `Schema<boolean>`

Schema that defines a valid boolean.

- Strings are coerced: known negative strings (`""`, `"false"`, `"0"`, `"no"`, `"n"`, `"off"`) become `false`, everything else becomes `true`.
- All other values are coerced with standard truthiness.

Validates a value into a `boolean`. Following the robustness principle, the strings `"no"` and `"false"` coerce to `false`, and any other value is tested for truthiness. A missing value falls back to the schema's `value` default (`false`).

`BOOLEAN` is the ready-made sugar instance for a boolean field.

## Usage

### Sugar instances

To save creating a new instance of `BooleanSchema` for trivial uses, you can use the `BOOLEAN` sugar instance instead.

```ts
import { BOOLEAN } from "shelving/schema";

BOOLEAN.validate(true);          // true
BOOLEAN.validate("false");       // false  (coerced)
BOOLEAN.validate("no");          // false  (coerced)
BOOLEAN.validate(1);             // true   (truthiness)
BOOLEAN.validate(undefined);     // false  (default)
```


## Signatures

```ts
new BooleanSchema({ value = false, required = false, ...options }: BooleanSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `BooleanSchemaOptions` |  |
| `.value` | `boolean \| undefined` | Default boolean value used when the input is `undefined`. Read only. Defaults to `false`. |
| `.required` | `boolean \| undefined` | When `true`, a falsy result is rejected as invalid. Read only. Defaults to `false`. |

## Returns

| Type | Description |
| --- | --- |
| `BooleanSchema` |  |

## Methods

- [BooleanSchema.validate()](BooleanSchema/validate.md): Validate an unknown value and coerce it to a boolean.
