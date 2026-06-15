# NullableSchema

Wraps another schema to allow `null` as a valid value. Following the robustness principle, `undefined` and the empty string `""` also coerce to `null`; any other value is delegated to the wrapped schema.

[`NULLABLE(schema)`](/schema/NULLABLE) is the sugar factory that builds a `NullableSchema` around an existing schema.

## Usage

```ts
import { NULLABLE, NUMBER } from "shelving/schema";

const NULLABLE_NUMBER = NULLABLE(NUMBER);
NULLABLE_NUMBER.validate(null);       // null
NULLABLE_NUMBER.validate(undefined);  // null
NULLABLE_NUMBER.validate("");         // null
NULLABLE_NUMBER.validate(42);         // 42
```

## See also

- [OptionalSchema](/schema/OptionalSchema) — the `undefined`-allowing equivalent.
- [schema](/schema) — overview of schema concepts and composition.
