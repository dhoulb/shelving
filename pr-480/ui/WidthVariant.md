# WidthVariant

- Kind: type
- Import: `import { WidthVariant } from "shelving/ui";`

Enumerated width selectable via the `width` variant prop.
- `narrow` / `normal` / `wide` — fixed widths from the `--width-*` tokens (capped at 100%).
- `full` — take the full available width.
- `fit` — shrink to fit the content's intrinsic width (`fit-content`).
- `1x`–`32x` — fixed multiples of `--space-normal` (1x–8x at 1x intervals, then 10x/12x, then 16x–32x at 4x intervals).

## Signatures

```ts
| "narrow"
	| "normal"
	| "wide"
	| "full"
	| "fit"
	| "1x"
	| "2x"
	| "3x"
	| "4x"
	| "5x"
	| "6x"
	| "7x"
	| "8x"
	| "10x"
	| "12x"
	| "16x"
	| "20x"
	| "24x"
	| "28x"
	| "32x"
```
