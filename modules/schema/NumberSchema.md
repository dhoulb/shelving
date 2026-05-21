# NumberSchema

Validates a value into a `number`. Strings that look like numbers are parsed, and a missing value falls back to the schema's `value` default (`0` by default). Construct a `NumberSchema` directly to add constraints like `min`, `max`, and `step`.

`NUMBER` is the ready-made constant for an unconstrained number; `INTEGER` is a `NumberSchema` with `step: 1` constrained to the safe-integer range.

## Usage

### The `NUMBER` constant

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

## See also

- [CurrencyAmountSchema](/schema/CurrencyAmountSchema) — a `NumberSchema` subclass for currency amounts.
- [StringSchema](/schema/StringSchema) — the string equivalent.
- [schema](/schema) — overview of schema concepts and composition.
