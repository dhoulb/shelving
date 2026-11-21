# formatUntil()

- Kind: function
- Import: `import { formatUntil } from "shelving/util/duration";`

Format a compact best-fit description of how long until a date, e.g. `10d` or `2h` or `-1w`
- See `getBestDurationUnit()` for details on how the best-fit unit is chosen.

## Signatures

```ts
formatUntil(target: PossibleDate, current?: PossibleDate, options?: UnitFormatOptions, caller: AnyCaller = formatUntil): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count up to. |
| `current` | `PossibleDate` | Date to count from (defaults to now). Optional. |
| `options` | `UnitFormatOptions` | Formatting options for the chosen duration unit. Optional. |
| `.one` | `string \| undefined` | String for one of this thing, e.g. `product` or `item` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
| `.many` | `string \| undefined` | String for several of this thing, e.g. `products` or `items` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to `one + "s"` Read only. Optional. |
| `.abbr` | `string \| undefined` | Abbreviation for this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s"). - Used for `unitDisplay: "narrow"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatUntil` itself). Defaults to `formatUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Compact string like `10d` or `2h` (negative if `target` is in the past). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
