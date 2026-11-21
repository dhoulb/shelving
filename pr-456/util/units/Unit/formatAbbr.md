# Unit.formatAbbr()

- Kind: method
- Member of: `Unit`

Format the short name of this unit on its own, e.g. `km` or `min`, with no number.
- Uses `Intl.NumberFormat` if this is a supported unit, so the name is translated.
- Falls back to this unit's `abbr` option, then to its key.

## Signatures

```ts
formatAbbr(options?: FormatOptions): string
```
