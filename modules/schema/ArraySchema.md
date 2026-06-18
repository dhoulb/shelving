# ArraySchema

Validates a value into a `readonly` array, validating each element against an `items` schema. Following the robustness principle, a comma-separated string is split into an array, and a missing value falls back to an empty array.

[`ARRAY(itemSchema)`](/schema/ARRAY) is the sugar factory that builds an `ArraySchema` for a given element schema.

## Usage

```ts
import { ARRAY, STRING, NUMBER } from "shelving/schema";

const TAGS = ARRAY(STRING);
TAGS.validate(["a", "b"]);     // ["a", "b"]
TAGS.validate("a,b,c");        // ["a", "b", "c"]  (split on comma)
TAGS.validate(undefined);      // []

const NUMBERS = ARRAY(NUMBER);
NUMBERS.validate([1, 2]);      // [1, 2]
NUMBERS.validate("1,2,3");     // [1, 2, 3]  (split on comma, each coerced)
NUMBERS.validate(undefined);   // []
```
