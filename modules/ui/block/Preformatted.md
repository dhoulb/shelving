# Preformatted

A block of preformatted text, such as code or terminal output. Renders a `<pre>` in a box with a monospace font.

**Things to know:**

- Newlines, spaces and tabs show as written. Tabs are two spaces wide.
- Long lines do not wrap. The block scrolls left and right. Set `wrap` to wrap long lines.
- The block is always full width.
- The box is painted from the tint ladder. Set `color=` on it, or `color=` or `status=` on an ancestor such as a `<Card>`, to recolour it.
- Inside `<Prose>` a raw `<pre>` gets the same styles, so Markdown code blocks match.
- For a short piece of code inside a sentence, use `<Code>`.

## Usage

### Code

```tsx live
import { Preformatted } from "shelving/ui";

<Preformatted>{`function add(a, b) {
	return a + b;
}`}</Preformatted>;
```

### Wrap long lines

```tsx live
import { Preformatted } from "shelving/ui";

<Preformatted wrap>
	{"This line is long, so it wraps onto the next line and the block does not scroll left and right at all."}
</Preformatted>;
```

### Colour

```tsx live
import { Preformatted } from "shelving/ui";

<Preformatted color="red">{"Error: Connection refused\n    at connect (db.ts:12)"}</Preformatted>;
```

## Styling

Override these hooks at `:root`. The tint hooks (`--preformatted-border`, `--preformatted-background`, `--preformatted-color`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable                      | Styles                                           | Default                            |
| ----------------------------- | ------------------------------------------------ | ---------------------------------- |
| `--preformatted-background`   | Background                                       | `var(--tint-90)`                   |
| `--preformatted-color`        | Text colour                                      | `var(--tint-00)`                   |
| `--preformatted-border`       | Border colour (width is `--preformatted-stroke`) | `var(--tint-80)`                   |
| `--preformatted-stroke`       | Border width (one length)                        | `var(--stroke-normal)` (1px)       |
| `--preformatted-radius`       | Corner radius                                    | `var(--radius-normal)` (16px)      |
| `--preformatted-space`        | Outer block margin (top and bottom)              | `var(--space-paragraph)` (16px)    |
| `--preformatted-padding`      | Inner top and bottom padding (one length)        | `var(--space-normal)` (16px)       |
| `--preformatted-indent`       | Inner left and right padding (one length)        | `var(--space-normal)` (16px)       |
| `--preformatted-shadow`       | Drop shadow                                      | `none`                             |
| `--preformatted-transition`   | Transition                                       | `all var(--duration-fast)` (150ms) |
| `--preformatted-focus-border` | Focus outline colour (width is `--stroke-focus`) | `var(--color-focus)`               |
| `--preformatted-font`         | Font family                                      | `var(--font-code)` (monospace)     |
| `--preformatted-weight`       | Font weight                                      | `var(--weight-code)` (500)         |
| `--preformatted-size`         | Font size                                        | `var(--size-normal)` (16px)        |
| `--preformatted-leading`      | Line height                                      | `var(--leading-auto)`              |

**Global tokens it reads:** the tint ladder `--tint-00` / `--tint-80` / `--tint-90`, plus `--stroke-normal`, `--stroke-focus`, `--radius-normal`, `--space-paragraph`, `--space-normal`, `--duration-fast`, `--color-focus`, `--font-code`, `--weight-code`, `--size-normal`, `--leading-auto`.
