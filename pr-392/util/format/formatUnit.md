# formatUnit()

- Kind: function
- Import: `import { formatUnit } from "shelving/util/format";`

Format a quantity of a given unit.

- Javascript has built-in support for formatting a number of different units.
- Unfortunately the list of supported units changes in different browsers.
- Ideally we want to format units using the built-in formatting so things like translation and internationalisation are covered.
- But we want provide fallback formatting for unsupported units, and do something _good enough_ job in most cases.
- Compound units like `kilometer-per-hour` use the built-in formatting when both parts are supported.

## Signatures

```ts
formatUnit(num: number, unit: string, options?: UnitFormatOptions): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `num` | `number` | Quantity to format. |
| `unit` | `string` | Unit reference to format the quantity as, e.g. `"minute"` or `"product"`. |
| `options` | `UnitFormatOptions` | Formatting options including custom `one`/`many`/`abbr` strings for unsupported units. Optional. |
| `.one` | `string \| undefined` | String for one of this thing, e.g. `product` or `item` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
| `.many` | `string \| undefined` | String for several of this thing, e.g. `products` or `items` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to `one + "s"` Read only. Optional. |
| `.abbr` | `string \| undefined` | Abbreviation for this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s"). - Used for `unitDisplay: "narrow"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Formatted quantity string, e.g. `"5 minutes"` or `"5 products"`. |
