# StringSchema

Validates a value into a `string`. Numbers are coerced to their string form, and a missing value falls back to the schema's `value` default (an empty string by default). Construct a `StringSchema` directly to add constraints like `min`, `max`, and `match`.

`STRING` is the ready-made sugar instance for an unconstrained string; `REQUIRED_STRING` is a `StringSchema` with `min: 1`, so an empty string fails validation.

## Usage

### Sugar instances

To save creating a new instance of `StringSchema` for trivial uses, you can use the `STRING` or `REQUIRED_STRING` sugar instances instead. The module also ships `TITLE` and `NAME` (1–100 characters) and their nullable variants `NULLABLE_TITLE` and `NULLABLE_NAME`.

```ts
import { STRING, REQUIRED_STRING } from "shelving/schema";

STRING.validate("hello");        // "hello"
STRING.validate(42);             // "42"   (numbers coerced)
STRING.validate(undefined);      // ""     (default)
REQUIRED_STRING.validate("");    // throws "Required"
```

### Custom string schemas

Construct a `StringSchema` to apply length and pattern constraints:

```ts
import { StringSchema } from "shelving/schema";

const USERNAME = new StringSchema({ title: "Username", min: 3, max: 20, match: /^[a-z0-9_]+$/ });
USERNAME.validate("alice_99");   // "alice_99"
USERNAME.validate("al");         // throws "Minimum 3 characters"
USERNAME.validate("ALICE");      // throws "Invalid string"
```
