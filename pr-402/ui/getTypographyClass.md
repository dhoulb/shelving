# getTypographyClass()

- Kind: function
- Import: `import { getTypographyClass } from "shelving/ui";`

Get the typography class for a component from its typographic variant props.

Maps the colour, size, weight, font, case, tint, alignment, wrap, and truncate variant props to their CSS classes — the `color` variant is composed in via `getColorClass()`.

The typography variant props set an element's text styling from a single helper — `<Heading font="title" size="large">`, `<Paragraph weight="strong" center>`, `<Small case="upper">`. They're **overrides** for one-off changes; for an app-wide change, retune the variables below in a theme file.

`getTypographyClass({ color, size, weight, font, case, tint, left, center, right, wrap, nowrap, truncate })` maps each prop to a class (e.g. `size="large"` → `size-large`, `font="title"` → `font-title`, `weight="strong"` → `weight-strong`, `case="upper"` → `case-upper`), and combines them with text alignment, tint colour, wrapping, and truncation. `TypographyVariants` extends `ColorVariants`, so it also accepts `color` and composes [`getColorClass()`](/ui/getColorClass) internally — anything that opts into typography gets the `color` variant for free and no longer needs to extend `ColorVariants` or call `getColorClass()` separately. (`getColorClass()` stays exported for the rare element that wants colour without typography, such as `<Icon>`.) It also supersedes the former `getFontClass()`, `getSizeClass()`, and `getWeightClass()` helpers, which were merged into this module.

The `truncate` flag cuts overflowing text to one line and ends it with an ellipsis. It works on a block element or a flex item, not on inline text. When the text is inside a wrapper that is a flex item, give that wrapper `grow` (see `getWidthClass()`), so it can shrink below the width of the text.

The semantic faces, weights, sizes, and cases are aliases of the base values, so a theme usually only needs to move the small set of base variables.

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app.

### Faces

| Variable | Default | Notes |
|---|---|---|
| `--font-sans` | `system-ui` | Default UI face. |
| `--font-monospace` | `ui-monospace, "SF Mono", "Consolas", "Menlo", monospace` | Code face. |
| `--font-serif` | `"Palatino", "Garamond", serif` | Serif face. |
| `--font-title` | `var(--font-sans)` | Headings and titles. |
| `--font-body` | `var(--font-sans)` | Body baseline. |
| `--font-label` | `var(--font-sans)` | Labels. |
| `--font-code` | `var(--font-monospace)` | Code and preformatted text. |

### Weights

| Variable | Default | Used for |
|---|---|---|
| `--weight-normal` | `400` | Body text. |
| `--weight-strong` | `700` | Bold / emphasis. |
| `--weight-title` | `var(--weight-strong)` | Headings and titles. |
| `--weight-body` | `var(--weight-normal)` | Body baseline. |
| `--weight-label` | `var(--weight-strong)` | Labels (`<Label>`, table/definition headers). |
| `--weight-code` | `500` | Monospace / code. |

### Sizes

| Variable | Default | Notes |
|---|---|---|
| `--size-scale` | `1.25` | Ratio between steps. |
| `--size-normal` | `1rem` | Base size — the root of the modular scale. |
| `--size-xxsmall` … `--size-xxxlarge` | `calc(var(--size-normal) * pow(var(--size-scale), n))` | Each step is the base scaled by a power of the ratio. |
| `--size-1x` … `--size-10x` | `calc(var(--size-normal) * n)` | Direct multiples of normal size. |
| `--size-icon` | `1.5rem` | Icon box size. |
| `--size-label` | `var(--size-small)` | Label text size. |
| `--size-smaller` | `0.875em` | Relative (em) shrink — e.g. inline `<Small>`. |
| `--size-larger` | `1.5em` | Relative grow. |
| `--size-xlarger` | `2.5em` | Relative grow. |
| `--size-xxlarger` | `5em` | Relative grow. |

### Line height

| Variable | Default | Used for |
|---|---|---|
| `--leading` | `clamp(1.05em, calc(1em + 0.5rem), 1.5em)` | Default line height; paired with every font-size variant and the body baseline. |
| `--leading-normal` | `1.5` | Plain unitless line height for dense blocks. |

### Case

| Variable | Default | Used for |
|---|---|---|
| `--case-title` | `none` | `text-transform` for titles and headings. |
| `--case-body` | `none` | `text-transform` for body text and the body baseline. |
| `--case-label` | `uppercase` | `text-transform` for labels and tags. |
| `--case-code` | `none` | `text-transform` for code and preformatted text. |


## Signatures

```ts
getTypographyClass({ tint, weight, font, case: caseValue, size, ...props }: TypographyVariants): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `TypographyVariants` |  |
| `.size` | `SizeVariant \| undefined` | Font size of the element. Optional. |
| `.tint` | `TintVariant \| undefined` | Set CSS text `color:` to one of the shades of the current tint ladder. Optional. |
| `.font` | `FontVariant \| undefined` | Font family of the element. Optional. |
| `.case` | `CaseVariant \| undefined` | Text case of the element. Optional. |
| `.weight` | `WeightVariant \| undefined` | Font weight of the element. Optional. |
| `.left` | `boolean \| undefined` | Align text to the start of the line (LTR: left). Optional. |
| `.center` | `boolean \| undefined` | Centre text horizontally. Optional. |
| `.right` | `boolean \| undefined` | Align text to the end of the line (LTR: right). Optional. |
| `.wrap` | `boolean \| undefined` | Enable wrapping. Optional. |
| `.nowrap` | `boolean \| undefined` | Disable wrapping. Optional. |
| `.truncate` | `boolean \| undefined` | Cut overflowing text to one line with an ellipsis (on a block or a flex item). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The combined typography class string (empty when no variants apply). |

## Examples

```ts
getTypographyClass({ font: "title", size: "large", center: true })
```
```ts
getTypographyClass({ color: "purple", tint: "40" })
```
