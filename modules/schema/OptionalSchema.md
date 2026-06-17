# OptionalSchema

Wraps another schema to allow `undefined` as a valid value. Any value other than `undefined` is delegated to the wrapped schema. It is mainly used for partial data props.

[`OPTIONAL(schema)`](/schema/OPTIONAL) is the sugar factory that builds an `OptionalSchema` around an existing schema.

## Usage

```ts
import { OPTIONAL, NUMBER } from "shelving/schema";

const OPTIONAL_NUMBER = OPTIONAL(NUMBER);
OPTIONAL_NUMBER.validate(undefined); // undefined
OPTIONAL_NUMBER.validate(42);        // 42
```

## See also

- [`NullableSchema`](/schema/NullableSchema) — the `null`-allowing equivalent.
- [schema](/schema) — overview of schema concepts and composition.
