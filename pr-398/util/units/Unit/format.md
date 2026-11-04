# Unit.format()

- Kind: method
- Member of: `Unit`

Format an amount with a given unit of measure, e.g. `12 kg` or `29.5 l`
- Uses `Intl.NumberFormat` if this is a supported unit (so e.g. `ounce` is translated to e.g. `Unze` in German).
- Polyfills unsupported units to use long/short form based on `options.unitDisplay`.

## Signatures

```ts
format(amount: number, options?: UnitFormatOptions): string
```
