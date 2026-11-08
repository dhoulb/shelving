# TypographyVariants

- Kind: interface
- Import: `import { TypographyVariants } from "shelving/ui";`
- Extends: `ColorVariants`

Typographic variant props — colour, font-family, weight, case, size, tint, alignment, wrap, and truncate, applied via `getTypographyClass()`

- Extends `ColorVariants`, so anything that accepts typography also accepts the `color` variant.

## Signatures

```ts
{
	size?: SizeVariant | undefined;
	tint?: TintVariant | undefined;
	font?: FontVariant | undefined;
	case?: CaseVariant | undefined;
	weight?: WeightVariant | undefined;
	left?: boolean | undefined;
	center?: boolean | undefined;
	right?: boolean | undefined;
	wrap?: boolean | undefined;
	nowrap?: boolean | undefined;
	truncate?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `size` | `SizeVariant \| undefined` | Font size of the element. Optional. |
| `tint` | `TintVariant \| undefined` | Set CSS text `color:` to one of the shades of the current tint ladder. Optional. |
| `font` | `FontVariant \| undefined` | Font family of the element. Optional. |
| `case` | `CaseVariant \| undefined` | Text case of the element. Optional. |
| `weight` | `WeightVariant \| undefined` | Font weight of the element. Optional. |
| `left` | `boolean \| undefined` | Align text to the start of the line (LTR: left). Optional. |
| `center` | `boolean \| undefined` | Centre text horizontally. Optional. |
| `right` | `boolean \| undefined` | Align text to the end of the line (LTR: right). Optional. |
| `wrap` | `boolean \| undefined` | Enable wrapping. Optional. |
| `nowrap` | `boolean \| undefined` | Disable wrapping. Optional. |
| `truncate` | `boolean \| undefined` | Cut overflowing text to one line with an ellipsis (on a block or a flex item). Optional. |
