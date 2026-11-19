# formatWhen()

- Kind: function
- Import: `import { formatWhen } from "shelving/util/duration";`

Format a compact best-fit description of when a date happens or happened, e.g. `in 10d` or `2h ago` or `in 1w` or `just now`
- See `getBestDurationUnit()` for details on how the best-fit unit is chosen.
- But: anything under a minute will show `just now`, which makes more sense in most UIs.

## Signatures

```ts
formatWhen(target: PossibleDate, current?: PossibleDate, options?: UnitFormatOptions, caller: AnyCaller = formatWhen): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date the duration is measured to. |
| `current` | `PossibleDate` | Date the duration is measured from (defaults to now). Optional. |
| `options` | `UnitFormatOptions` | Formatting options for the chosen duration unit. Optional. |
| `.one` | `string \| undefined` | String for one of this thing, e.g. `product` or `item` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
| `.many` | `string \| undefined` | String for several of this thing, e.g. `products` or `items` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to `one + "s"` Read only. Optional. |
| `.abbr` | `string \| undefined` | Abbreviation for this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s"). - Used for `unitDisplay: "narrow"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatWhen` itself). Defaults to `formatWhen`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Compact string like `in 10d`, `2h ago`, or `just now`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |
