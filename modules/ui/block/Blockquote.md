# Blockquote

A block of quoted text. Renders a `<blockquote>` with a line on its left edge.

**Things to know:**

- Put block content inside it, such as `<Paragraph>`. It trims the outer margins of its first and last children, so its padding is not doubled. Set `trim={false}` to keep them.
- It is `display: flow-root`, so the margins of its children stay inside it.
- The line is painted from the tint ladder. Set `color=` or `status=` on it (or an ancestor) to recolour the line.
- Inside `<Prose>` a raw `<blockquote>` gets the same styles, so Markdown quotes match.
- Composes the standard block variants: `color`, `status`, `space`, `padding`, `indent`, `width`, plus typography.

## Usage

### Quote

```tsx live
import { Blockquote, Paragraph } from "shelving/ui";

<Blockquote>
	<Paragraph>Simplicity, brevity, clarity, humanity.</Paragraph>
</Blockquote>;
```

### Quote with a source

```tsx live
import { Blockquote, Paragraph, Small } from "shelving/ui";

<Blockquote>
	<Paragraph>Clutter is the disease of American writing.</Paragraph>
	<Paragraph>
		<Small>William Zinsser</Small>
	</Paragraph>
</Blockquote>;
```

### Colour

```tsx live
import { Blockquote, Paragraph } from "shelving/ui";

<Blockquote color="purple" font="serif" size="large">
	<Paragraph>A purple line, with larger serif text.</Paragraph>
</Blockquote>;
```

## Styling

Override these hooks at `:root`. The tint hook (`--blockquote-border`) is declared again in every tint scope, so override it at `:root, .tint`.

| Variable               | Styles                                    | Default                         |
| ---------------------- | ----------------------------------------- | ------------------------------- |
| `--blockquote-border`  | Colour of the left line                   | `var(--tint-90)`                |
| `--blockquote-stroke`  | Width of the left line (one length)       | `var(--stroke-normal)` (1px)    |
| `--blockquote-space`   | Outer block margin (top and bottom)       | `var(--space-paragraph)` (16px) |
| `--blockquote-padding` | Inner top and bottom padding (one length) | `var(--space-small)` (12px)     |
| `--blockquote-indent`  | Inner left padding (one length)           | `var(--space-normal)` (16px)    |
| `--blockquote-color`   | Text colour                               | `inherit`                       |
| `--blockquote-font`    | Font family                               | `inherit`                       |
| `--blockquote-weight`  | Font weight                               | `var(--weight-normal)` (400)    |
| `--blockquote-size`    | Font size                                 | `inherit`                       |
| `--blockquote-leading` | Line height                               | `inherit`                       |
| `--blockquote-align`   | Text alignment                            | `left`                          |

**Global tokens it reads:** `--tint-90`, `--stroke-normal`, `--space-paragraph`, `--space-small`, `--space-normal`, `--weight-normal`.
