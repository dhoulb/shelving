# formatAgo()

- Kind: function
- Import: `import { formatAgo } from "shelving/util/duration";`

Format a compact best-fit description of how long since a date, e.g. `10d` or `2h` or `just now`
- See `getBestDurationUnit()` for details on how the best-fit unit is chosen.
- Anything under a minute (either way) shows `just now`.

## Signatures

```ts
formatAgo(target: PossibleDate, current?: PossibleDate, options?: UnitFormatOptions, caller: AnyCaller = formatAgo): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to count back from. |
| `current` | `PossibleDate` | Date to count to (defaults to now). Optional. |
| `options` | `UnitFormatOptions` | Formatting options for the chosen duration unit. Optional. |
| `.one` | `string \| undefined` | String for one of this thing, e.g. `product` or `item` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
| `.many` | `string \| undefined` | String for several of this thing, e.g. `products` or `items` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to `one + "s"` Read only. Optional. |
| `.abbr` | `string \| undefined` | Abbreviation for this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s"). - Used for `unitDisplay: "narrow"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatAgo` itself). Defaults to `formatAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Compact string like `10d`, `2h` or `just now` (negative if `target` is in the future). |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
