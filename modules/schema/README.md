# schema

Schema validation for TypeScript. A [`Schema<T>`](/schema/Schema) describes how to coerce and validate an unknown value into a typed `T`. Schemas are the foundation of shelving — database collections, API endpoints, and form handlers all build on them.

By convention, instantiated schemas are constants and use `UPPERCASE`.

## Concepts

### The `Schema<T>` interface

Every schema has a single [`.validate()`](/schema/Schema/validate) method — `validate(value: unknown): T`. If the value is valid (after any coercion), it returns `T`. If it is not, it throws a plain **string** error message — for example `"Must be 5–50 characters"` or `"Required"`. This is intentional: form handlers and API layers can consume these strings directly without any unwrapping.

Multi-field errors from [`DataSchema`](/schema/DataSchema) are joined by `\n`, one line per failed field, with the field name prepended: `"name: Required\nemail: Invalid format"`.

### Default value

`validate()` is called with `undefined` when no value is provided; the schema falls back to its [`.value`](/schema/Schema/value) default.

### Coercion

Schema functionality in Shelving follows the **robustness principle**: "be conservative in what you do, be liberal in what you accept from others". Values that are obvious in their intent are coerced to appropriate valid values.

[`StringSchema`](/schema/StringSchema) converts numbers to strings, [`BooleanSchema`](/schema/BooleanSchema) converts the strings `"no"` and `"false"` to `false` and tests other values for truthiness, [`ArraySchema`](/schema/ArraySchema) splits comma-separated strings into arrays, [`NumberSchema`](/schema/NumberSchema) parses strings into numbers.

### Metadata

Every schema carries optional display metadata set at construction time:

| Property      | Default         | Purpose                                            |
| ------------- | --------------- | -------------------------------------------------- |
| [`.one`](/schema/Schema/one)         | `"value"`       | Singular noun, e.g. `"product"`                   |
| [`.many`](/schema/Schema/many)        | `one + "s"`     | Plural noun, e.g. `"products"`                    |
| [`.title`](/schema/Schema/title)       | `""`            | Human-readable label for a field                  |
| [`.description`](/schema/Schema/description) | `""`            | Longer description for a field                    |
| [`.placeholder`](/schema/Schema/placeholder) | `""`            | Placeholder text for an input                     |
| [`.value`](/schema/Schema/value)       | schema-specific | Default used when `validate(undefined)` is called |
| [`.format()`](/schema/Schema/format)      | schema-specific | Display formatter for downstream form and UI use  |

### Sugar instances and factories

For convenience the [`schema`](/schema) module offers sugar constants and factories to improve the readability of code that creates complex schemas. Sugar instances are pre-instantiated copies of [`Schema`](/schema/Schema) classes — by convention an instantiated schema is named in `ALL_CAPS`, a convention you will find it convenient to use in your own codebase too. Sugar factories are functions like [`OPTIONAL()`](/schema/OPTIONAL) and [`DATA()`](/schema/DATA) that build a configured schema for you.

| Sugar instance / factory | Validated type       |
| ----------------------- | -------------------- |
| [`STRING`](/schema/STRING)                | `string`             |
| [`NUMBER`](/schema/NUMBER)                | `number`             |
| [`CURRENCY_AMOUNT(code)`](/schema/CURRENCY_AMOUNT) | `number`             |
| [`BOOLEAN`](/schema/BOOLEAN)               | `boolean`            |
| [`DATA(props)`](/schema/DATA)           | `T` (plain object)   |
| [`ARRAY(itemSchema)`](/schema/ARRAY)     | `readonly T[]`       |
| [`CHOICE(options)`](/schema/CHOICE)       | union of string keys |
| [`NULLABLE(schema)`](/schema/NULLABLE)      | `T \| null`          |
| [`OPTIONAL(schema)`](/schema/OPTIONAL)      | `T \| undefined`     |
| [`PARTIAL(schema)`](/schema/PARTIAL)       | `Partial<T>`         |
| [`ITEM(idSchema, props)`](/schema/ITEM) | `{ id: I } & T`      |

## Usage

Schemas compose: primitives, wrappers ([`NULLABLE()`](/schema/NULLABLE), [`OPTIONAL()`](/schema/OPTIONAL), [`ARRAY()`](/schema/ARRAY)), and [`DATA()`](/schema/DATA) nest freely to describe an entire payload in a single validator. See each schema's own page for detailed usage of that class and its constants.

```ts
import { ITEM, STRING, REQUIRED_STRING, NUMBER, ARRAY, OPTIONAL, INTEGER } from "shelving/schema";

const PRODUCT = ITEM(INTEGER, {
  name: REQUIRED_STRING,
  price: NUMBER,
  tags: ARRAY(STRING),
  notes: OPTIONAL(STRING),
});

PRODUCT.validate({ id: 1, name: "Widget", price: 9.99, tags: "a,b" });
// { id: 1, name: "Widget", price: 9.99, tags: ["a", "b"], notes: undefined }

PRODUCT.validate({ id: 2, name: "", price: 9.99, tags: [] });
// throws "name: Required"
```

## See also

- [`util`](/util/data) — [`Data`](/util/data/Data), [`Item`](/util/item/Item), query, and update types consumed by schemas.
- [`db`](/db) — [`Collection`](/db/Collection) extends [`DataSchema`](/schema/DataSchema) and uses schemas to validate stored documents.
