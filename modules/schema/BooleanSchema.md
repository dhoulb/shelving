# BooleanSchema

Validates a value into a `boolean`. Following the robustness principle, the strings `"no"` and `"false"` coerce to `false`, and any other value is tested for truthiness. A missing value falls back to the schema's `value` default (`false`).

[`BOOLEAN`](/schema/BOOLEAN) is the ready-made sugar instance for a boolean field.

## Usage

### Sugar instances

To save creating a new instance of `BooleanSchema` for trivial uses, you can use the [`BOOLEAN`](/schema/BOOLEAN) sugar instance instead.

```ts
import { BOOLEAN } from "shelving/schema";

BOOLEAN.validate(true);          // true
BOOLEAN.validate("false");       // false  (coerced)
BOOLEAN.validate("no");          // false  (coerced)
BOOLEAN.validate(1);             // true   (truthiness)
BOOLEAN.validate(undefined);     // false  (default)
```

## See also

- [schema](/schema) — overview of schema concepts and composition.
