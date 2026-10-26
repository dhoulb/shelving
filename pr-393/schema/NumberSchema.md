# NumberSchema

- Kind: class
- Import: `import { NumberSchema } from "shelving/schema";`
- Extends: `Schema<number>`

Schema that defines a valid number.

- Values are coerced with `getNumber`; anything that cannot become a number is rejected.
- The number is snapped to `step` (if set), then checked against `min` and `max`.

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


## Signatures

```ts
new NumberSchema({
		one = "number",
		title = "Number",
		min = Number.NEGATIVE_INFINITY,
		max = Number.POSITIVE_INFINITY,
		step,
		value,
		...options
	}: NumberSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `NumberSchemaOptions` |  |
| `.value` | `number \| undefined` | Default number value used when the input is `undefined`. Read only. Optional. |
| `.min` | `number \| undefined` | Minimum allowed value. Read only. Defaults to `Number.NEGATIVE_INFINITY`. |
| `.max` | `number \| undefined` | Maximum allowed value. Read only. Defaults to `Number.POSITIVE_INFINITY`. |
| `.step` | `number \| undefined` | Rounding step the value is snapped to (e.g. `1` for integers). Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `NumberSchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `min` | `number` | Read only. |
| `max` | `number` | Read only. |
| `step` | `number \| undefined` | Read only. |
