# ArraySchema

- Kind: class
- Import: `import { ArraySchema } from "shelving/schema";`
- Extends: `Schema<ImmutableArray<T>>`

Schema that validates an array and ensures every item matches a specified item schema.

- A string input is split into items using `separator`.
- Items are optionally deduplicated (`unique`), then the count is checked against `min` and `max`.

Validates a value into a `readonly` array, validating each element against an `items` schema. Following the robustness principle, a comma-separated string is split into an array, and a missing value falls back to an empty array.

`ARRAY(itemSchema)` is the sugar factory that builds an `ArraySchema` for a given element schema.

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


## Signatures

```ts
new ArraySchema<T>({
		items,
		one = items.one,
		many = items.many,
		title = "Items",
		placeholder = `No ${many}`,
		unique = false,
		min = 0,
		max = Number.POSITIVE_INFINITY,
		separator = ",",
		value = [],
		...options
	}: ArraySchemaOptions<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `ArraySchemaOptions<T>` |  |
| `.value` | `ImmutableArray` | Default value used when the input is `undefined`. Read only. Defaults to `[]`. |
| `.items` | `Schema<T>` | Schema every item in the array must conform to. Read only. |
| `.min` | `number` | Minimum number of items. Read only. Defaults to `0`. |
| `.max` | `number` | Maximum number of items. Read only. Defaults to `Number.POSITIVE_INFINITY`. |
| `.unique` | `boolean` | Whether to deduplicate the items. Read only. Defaults to `false`. |
| `.separator` | `string \| RegExp` | String or `RegExp` used to split a string input into items. Read only. Defaults to `","`. |

## Returns

| Type | Description |
| --- | --- |
| `ArraySchema<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `items` | `Schema<T>` | Read only. |
| `unique` | `boolean` | Read only. |
| `min` | `number` | Read only. |
| `max` | `number` | Read only. |
| `separator` | `string \| RegExp` | Read only. |
