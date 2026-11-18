# DateSchema

- Kind: class
- Import: `import { DateSchema } from "shelving/schema";`
- Extends: `Schema<string>`

Schema that defines a valid date stored as a `YYYY-MM-DD` string, e.g. `2005-09-12`.

- Validates an abstract date without a timezone; use `DateTimeSchema` for UTC datetimes and `TimeSchema` for times.
- The input is coerced to a `Date`, optionally rounded to `step`, range-checked against `min`/`max`, then stringified.

## Signatures

```ts
new DateSchema({ one = "date", min, max, value, input = "date", step, ...options }: DateSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `DateSchemaOptions` |  |
| `.value` | `PossibleDate \| undefined` | Default date used when the input is `undefined`. Read only. Optional. |
| `.min` | `Nullish<PossibleDate>` | Earliest allowed date (`null` for no bound). Read only. Optional. |
| `.max` | `Nullish<PossibleDate>` | Latest allowed date (`null` for no bound). Read only. Optional. |
| `.input` | `DateInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"date"`. |
| `.step` | `number \| undefined` | Rounding step (in milliseconds, because that's the base unit for time). - E.g. `1000 * 60` will round to the nearest minute. - Note: HTML `<input>` `step` attributes are in _seconds_, so you may need to convert units. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `DateSchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `min` | `Date \| undefined` | Earliest allowed date, or `undefined` for no minimum. Read only. |
| `max` | `Date \| undefined` | Latest allowed date, or `undefined` for no maximum. Read only. |
| `input` | `DateInputType` | HTML `<input />` `type=""` hint for downstream UIs. Read only. |
| `step` | `number \| undefined` | Rounding step in milliseconds, or `undefined` for no rounding. Read only. |

## Examples

```ts
const schema = new DateSchema({ min: "2000-01-01" });
 schema.validate("2005-09-12"); // "2005-09-12"
```

## Methods

- [DateSchema.stringify()](DateSchema/stringify.md): Convert a Date object to the string representation used by this schema.
