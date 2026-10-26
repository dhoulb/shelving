# formatUnitAbbr()

- Kind: function
- Import: `import { formatUnitAbbr } from "shelving/util/format";`

Format the short name of a unit on its own, e.g. `"km"` or `"min"`, with no number.

- Uses the `Intl.NumberFormat` short name when the browser supports the unit, so the name is translated (e.g. `"Std."` for `hour` in German).
- Falls back to `options.abbr`, then to the unit reference itself, when the browser does not support the unit.
- Gives the name for an amount of one, so some units in some locales differ from their plural form (e.g. `"day"` not `"days"`).

## Signatures

```ts
formatUnitAbbr(unit: string, options?: UnitFormatOptions): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `unit` | `string` | Unit reference, e.g. `"minute"` or `"product"`. |
| `options` | `UnitFormatOptions` | Optional. |
| `.one` | `string \| undefined` | String for one of this thing, e.g. `product` or `item` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
| `.many` | `string \| undefined` | String for several of this thing, e.g. `products` or `items` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to `one + "s"` Read only. Optional. |
| `.abbr` | `string \| undefined` | Abbreviation for this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s"). - Used for `unitDisplay: "narrow"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The short name of the unit, e.g. `"min"`. |

## Examples

```ts
formatUnitAbbr("kilometer") // "km"
```
```ts
formatUnitAbbr("dog", { abbr: "🐶" }) // "🐶"
```
