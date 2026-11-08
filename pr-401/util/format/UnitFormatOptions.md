# UnitFormatOptions

- Kind: interface
- Import: `import { UnitFormatOptions } from "shelving/util/format";`
- Extends: `FormatOptions`

Options for quantity formatting.

## Signatures

```ts
{
	readonly one?: string | undefined;
	readonly many?: string | undefined;
	readonly abbr?: string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `one` | `string \| undefined` | String for one of this thing, e.g. `product` or `item` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
| `many` | `string \| undefined` | String for several of this thing, e.g. `products` or `items` or `sheep` - Used for `unitDisplay: "long"` formatting. - Defaults to `one + "s"` Read only. Optional. |
| `abbr` | `string \| undefined` | Abbreviation for this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s"). - Used for `unitDisplay: "narrow"` formatting. - Defaults to unit reference, e.g. "minute" Read only. Optional. |
