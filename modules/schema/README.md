# schema

Schema validation for TypeScript. A `Schema<T>` describes how to coerce and validate an unknown value into a typed `T`. Schemas are the foundation of shelving — database collections, API endpoints, and form handlers all build on them.

By convention, instantiated schemas are constants and use `UPPERCASE`.

## Concepts

### The `Schema<T>` interface

Every schema has a single `validate(value: unknown): T` method. If the value is valid (after any coercion), it returns `T`. If it is not, it throws a plain **string** error message — for example `"Must be 5–50 characters"` or `"Required"`. This is intentional: form handlers and API layers can consume these strings directly without any unwrapping.

Multi-field errors from `DataSchema` are joined by `\n`, one line per failed field, with the field name prepended: `"name: Required\nemail: Invalid format"`.

### Default value

`validate()` is called with `undefined` when no value is provided; the schema falls back to its `value` default.

### Coercion

Schema functionality in Shelving follows the **robustness principle**: "be conservative in what you do, be liberal in what you accept from others". Values that are obvious in their intent are coerced to appropriate valid values.

`StringSchema` converts numbers to strings, `BooleanSchema` converts the strings `"no"` and `"false"` to `false` and tests other values for truthiness, `ArraySchema` splits comma-separated strings into arrays, `NumberSchema` parses strings into numbers.

### Metadata

Every schema carries optional display metadata set at construction time:

| Property      | Default         | Purpose                                            |
| ------------- | --------------- | -------------------------------------------------- |
| `one`         | `"value"`       | Singular noun, e.g. `"product"`                   |
| `many`        | `one + "s"`     | Plural noun, e.g. `"products"`                    |
| `title`       | `""`            | Human-readable label for a field                  |
| `description` | `""`            | Longer description for a field                    |
| `placeholder` | `""`            | Placeholder text for an input                     |
| `value`       | schema-specific | Default used when `validate(undefined)` is called |
| `format`      | schema-specific | Display formatter for downstream form and UI use  |

### Factory constants

Pre-built constants and factory functions cover the most common cases:

| Constant / factory      | Validated type       |
| ----------------------- | -------------------- |
| `STRING`                | `string`             |
| `NUMBER`                | `number`             |
| `CURRENCY`              | `number`             |
| `BOOLEAN`               | `boolean`            |
| `DATA(props)`           | `T` (plain object)   |
| `ARRAY(itemSchema)`     | `readonly T[]`       |
| `CHOICE(options)`       | union of string keys |
| `NULLABLE(schema)`      | `T \| null`          |
| `OPTIONAL(schema)`      | `T \| undefined`     |
| `PARTIAL(schema)`       | `Partial<T>`         |
| `ITEM(idSchema, props)` | `{ id: I } & T`      |

## Usage

### Primitive schemas

```ts
import { STRING, NUMBER, BOOLEAN, REQUIRED_STRING } from "shelving/schema";

STRING.validate("hello");        // "hello"
STRING.validate(42);             // "42"   (numbers coerced)
STRING.validate(undefined);      // ""     (default)
REQUIRED_STRING.validate("");    // throws "Required"

NUMBER.validate("3.14");         // 3.14   (strings coerced)
NUMBER.validate(undefined);      // 0      (default)

BOOLEAN.validate("false");       // false
BOOLEAN.validate(1);             // true
```

### Custom string and number schemas

```ts
import { CurrencyAmountSchema, StringSchema, NumberSchema } from "shelving/schema";

const USERNAME = new StringSchema({ title: "Username", min: 3, max: 20, match: /^[a-z0-9_]+$/ });
USERNAME.validate("alice_99");   // "alice_99"
USERNAME.validate("al");         // throws "Minimum 3 characters"
USERNAME.validate("ALICE");      // throws "Invalid format"

const RATING = new NumberSchema({ title: "Rating", min: 1, max: 5, step: 1 });
RATING.validate(3);              // 3
RATING.validate(0);              // throws "Minimum 1"

const PRICE = new CurrencyAmountSchema({ title: "Price", currency: "GBP", min: 0 });
PRICE.validate("12.345");        // 12.35
PRICE.format(12.3);              // "£12.30"
```

### Choice schemas

Define a schema where a user must choose from a list of known valid values. Designed to power a `<select>` field in HTML.

```ts
import { CHOICE } from "shelving/schema";

// Array form — keys and labels are the same.
const STATUS = CHOICE(["draft", "published", "archived"] as const);
STATUS.validate("published"); // "published"
STATUS.validate("deleted");   // throws "Unknown value"

// Object form — keys are validated values, object values are display labels.
const Priority = CHOICE({ low: "Low priority", high: "High priority" });
```

`ChoiceSchema` is iterable and exposes `.keys()` and `.entries()` for building select menus. It does not implicitly default to the first option; pass `value` if you want a preselected choice.

### Data schemas

The term `Data` in Shelving refers to a plain object with known named properties. A `DataSchema` validates a plain object whose properties each have their own schema.

```ts
import { DATA, STRING, NUMBER, BOOLEAN, StringSchema, NumberSchema } from "shelving/schema";

const PRODUCT = DATA({
  name: new StringSchema({ title: "Name", min: 1, max: 100 }),
  price: new NumberSchema({ title: "Price", min: 0 }),
  available: BOOLEAN,
});

PRODUCT.validate({ name: "Widget", price: 9.99, available: true });
// { name: "Widget", price: 9.99, available: true }

PRODUCT.validate({ name: "", price: -1, available: true });
// throws "name: Required\nprice: Minimum 0"
```

Use `.pick()` and `.omit()` to derive subset schemas without redefining props:

```ts
const PatchProduct = Product.omit("available");
const NameOnly = Product.pick("name");
```

### Array schemas

Arrays have a `items` property that defines the schema

```ts
import { ARRAY, STRING } from "shelving/schema";

const TAGS = ARRAY(STRING);
TAGS.validate(["a", "b"]);     // ["a", "b"]
TAGS.validate("a,b,c");        // ["a", "b", "c"]  (split on comma)
TAGS.validate(undefined);      // []

const NUMBERS = ARRAY(STRING);
NUMBERS.validate([1, 2]);     // [1, 2]
NUMBERS.validate("1,2,3");        // [1, 2, 3]  (split on comma)
NUMBERS.validate(undefined);      // []
```

### Item schemas

`ITEM` wraps a `DataSchema` to add a typed `id` field, matching the `Item` type in [util](../util/README.md).

```ts
import { ITEM, STRING, INTEGER, NUMBER } from "shelving/schema";

const PRODUCT_ITEM = ITEM(INTEGER, {
  name: STRING,
  price: NUMBER,
}); // Validates: { id: number, name: string, price: number }
```

### Nullable and optional

`NULLABLE` allows a value to be `null` (and also coerces `undefined` and `""` to `null`). `OPTIONAL` allows `undefined` and is mainly used for partial data props.

```ts
import { NULLABLE, OPTIONAL, NUMBER } from "shelving/schema";

const NULLABLE_NUMBER = NULLABLE(NUMBER);
NULLABLE_NUMBER.validate(null);       // null
NULLABLE_NUMBER.validate(undefined);  // null
NULLABLE_NUMBER.validate("");         // null
NULLABLE_NUMBER.validate(42);         // 42

const OPTIONAL_NUMBER = OPTIONAL(NUMBER);
OPTIONAL_NUMBER.validate(undefined); // undefined
OPTIONAL_NUMBER.validate(42);        // 42
```

### Partial schemas

`PARTIAL` wraps a `DataSchema` so every field becomes optional — useful for PATCH-style update payloads.

```ts
import { PARTIAL } from "shelving/schema";

const PARTIAL_PRODUCT = PARTIAL(PRODUCT);
PARTIAL_PRODUCT.validate({ price: 4.99 }); // { price: 4.99 }
```

## See also

- [util](../util/README.md) — `Data`, `Item`, query, and update types consumed by schemas.
- [db](../db/README.md) — `Collection` extends `DataSchema` and uses schemas to validate stored documents.
