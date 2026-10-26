# DataSchema

- Kind: class
- Import: `import { DataSchema } from "shelving/schema";`
- Extends: `Schema<unknown>`

Schema that validates a data object against a fixed set of named property schemas.

- Each property is validated by its own schema in `props`.
- Excess keys are stripped and `undefined` outputs removed (via `validateData()`).

Validates a plain object whose properties each have their own schema. The term `Data` in Shelving refers to a plain object with known named properties; a `DataSchema` is the validator for one.

When several properties fail, the errors are joined by `\n` with each field name prepended — e.g. `"name: Required\nprice: Minimum 0"`. This file also exports the `DATA`, `ITEM`, and `PARTIAL` sugar factories that build `DataSchema` instances.

## Usage

### `DATA` — validate an object

```ts
import { DATA, BOOLEAN, StringSchema, NumberSchema } from "shelving/schema";

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
const PatchProduct = PRODUCT.omit("available");
const NameOnly = PRODUCT.pick("name");
```

### `ITEM` — add a typed `id` field

`ITEM` wraps a `DataSchema` to add a typed `id` field, matching the `Item` type in `shelving/util/item`.

```ts
import { ITEM, STRING, INTEGER, NUMBER } from "shelving/schema";

const PRODUCT_ITEM = ITEM(INTEGER, {
  name: STRING,
  price: NUMBER,
}); // Validates: { id: number, name: string, price: number }
```

### `PARTIAL` — make every field optional

`PARTIAL` wraps a `DataSchema` so every field becomes optional — useful for PATCH-style update payloads.

```ts
import { PARTIAL } from "shelving/schema";

const PARTIAL_PRODUCT = PARTIAL(PRODUCT);
PARTIAL_PRODUCT.validate({ price: 4.99 }); // { price: 4.99 }
```


## Signatures

```ts
new DataSchema<T>({ one = "item", title = "Item", props, value: partialValue, ...options }: DataSchemaOptions<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `DataSchemaOptions<T>` |  |
| `.props` | `Schemas<T>` | A named schema for each property the data object must have. Read only. |
| `.value` | `Partial<T> \| undefined` | Partial default value merged over the per-prop defaults. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `DataSchema<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `props` | `Schemas<T>` | Read only. |

## Methods

- [pick](DataSchema/pick.md): Make a new DataSchema that only uses a defined subset of the current props.
- [omit](DataSchema/omit.md): Make a new DataSchema that omits one or more of the current props.
