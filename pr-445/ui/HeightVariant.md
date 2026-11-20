# HeightVariant

- Kind: type
- Import: `import { HeightVariant } from "shelving/ui";`

Enumerated height selectable via the `height` variant prop.
- `full` — at least the full height of the container.
- `1x`–`32x` — at least a multiple of `--space-normal` (1x–8x at 1x intervals, then 10x/12x, then 16x–32x at 4x intervals).
- Each value is a minimum (`min-block-size`), so the element grows when its content is taller and nothing is cut off.

## Signatures

```ts
| "full"
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
