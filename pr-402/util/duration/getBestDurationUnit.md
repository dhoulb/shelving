# getBestDurationUnit()

- Kind: function
- Import: `import { getBestDurationUnit } from "shelving/util/duration";`

Get a best-fit duration unit based on an amount in milliseconds.
- Makes a sensible choice about the best time unit to use.
- Years will be used for anything 18 months or more, e.g. `in 2 years`
- Months will be used for anything 10 weeks or more, e.g. `in 14 months`
- Weeks will be used for anything 10 days or more, e.g. `in 9 weeks`
- Days will be used for anything 1 day or more, e.g. `in 13 days`
- Hours will be used for anything 1 hour or more, e.g. `in 23 hours`
- Minutes will be used for anything 1 minute or more, e.g. `1 minute ago` or `in 59 minutes`
- Seconds will be used for anything 1000 milliseconds or more, e.g. `in 59 seconds`

## Signatures

```ts
getBestDurationUnit(ms: number): Unit<DurationUnitKey>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `ms` | `number` | Amount of time in milliseconds (the sign is ignored, only the magnitude matters). |

## Returns

| Type | Description |
| --- | --- |
| `Unit<DurationUnitKey>` | The best-fit `Unit` from `DURATION_UNITS` for the given magnitude. |
