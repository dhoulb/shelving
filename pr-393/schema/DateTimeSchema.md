# DateTimeSchema

- Kind: class
- Import: `import { DateTimeSchema } from "shelving/schema";`
- Extends: `DateSchema`

Schema that defines a valid UTC datetime in ISO 8601 format, e.g. `2005-09-12T18:15:00.000Z`.

- The date includes the `Z` suffix to indicate UTC time, this ensures consistent transfer of the date between client and server.
- If you wish to define an _abstract_ date without a timezone, e.g. a birthday or anniversary, use `DateSchema` instead.
- If you wish to define an _abstract_ time without a timezone, e.g. a daily alarm, use `TimeSchema` instead.

## Signatures

```ts
new DateTimeSchema({ one = "time", title = "Time", input = "datetime-local", ...options }: DateSchemaOptions)
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
| `DateTimeSchema` |  |

## Examples

```ts
const schema = new DateTimeSchema({});
 schema.validate("2005-09-12T18:15:00Z"); // "2005-09-12T18:15:00.000Z"
```
