# BooleanSchema

Validates a value into a `boolean`. Following the robustness principle, the strings `"no"` and `"false"` coerce to `false`, and any other value is tested for truthiness. A missing value falls back to the schema's `value` default (`false`).

`BOOLEAN` is the ready-made constant for a boolean field.

## Usage

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
