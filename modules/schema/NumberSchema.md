# NumberSchema

Validates a value into a `number`. Strings that look like numbers are parsed, and a missing value falls back to the schema's `value` default (`0` by default). Construct a `NumberSchema` directly to add constraints like `min`, `max`, and `step`.

`NUMBER` is the ready-made sugar instance for an unconstrained number; `INTEGER` is a `NumberSchema` with `step: 1` constrained to the safe-integer range.

## Usage

### Sugar instances

To save creating a new instance of `NumberSchema` for trivial uses, you can use the `NUMBER` or `INTEGER` sugar instances instead. The module also ships the constrained integer variants `POSITIVE_INTEGER`, `NON_NEGATIVE_INTEGER`, `NEGATIVE_INTEGER`, and `NON_POSITIVE_INTEGER`, the `TIMESTAMP` Unix-timestamp instance, and nullable variants such as `NULLABLE_NUMBER` and `NULLABLE_INTEGER`.

```ts
import { NUMBER } from "shelving/schema";

NUMBER.validate("3.14");         // 3.14   (strings coerced)
NUMBER.validate(undefined);      // 0      (default)
```

### Custom number schemas

Construct a `NumberSchema` to apply range and step constraints:

```ts
import { NumberSchema } from "shelving/schema";

const RATING = new NumberSchema({ title: "Rating", min: 1, max: 5, step: 1 });
RATING.validate(3);              // 3
RATING.validate(0);              // throws "Minimum 1"
```
