# TimeSchema

- Kind: class
- Import: `import { TimeSchema } from "shelving/schema";`
- Extends: `DateSchema`

Schema that defines a valid abstract time in 24h `hh:mm:ss.fff` format, e.g. `23:59` or `24:00`.

- Validates a time without a timezone, e.g. a daily alarm; use `DateSchema` for dates and `DateTimeSchema` for UTC datetimes.

## Signatures

```ts
new TimeSchema({ one = "time", title = "Time", input = "time", ...options }: DateSchemaOptions)
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
| `TimeSchema` |  |

## Examples

```ts
const schema = new TimeSchema({});
 schema.validate("23:59"); // "23:59:00.000"
```
