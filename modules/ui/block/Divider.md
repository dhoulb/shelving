# Divider

A horizontal line between blocks of content. Renders an `<hr>`.

**Things to know:**

- The line is painted from the tint ladder. Set `color=` or `status=` on it (or an ancestor) to recolour it.
- Set `space=` to change the space above and below the line.
- Inside `<Prose>` a raw `<hr>` gets the same styles, so a Markdown `---` matches.

## Usage

```tsx live
import { Divider, Paragraph } from "shelving/ui";

<Paragraph>First part.</Paragraph>
<Divider />
<Paragraph>Second part.</Paragraph>
```

### Colour and space

```tsx live
import { Divider, Paragraph } from "shelving/ui";

<Paragraph>First part.</Paragraph>
<Divider color="blue" space="large" />
<Paragraph>Second part.</Paragraph>
```

## Styling

Override these hooks at `:root`. The tint hook (`--divider-border`) is declared again in every tint scope, so override it at `:root, .tint`.

| Variable           | Styles                              | Default                         |
| ------------------ | ----------------------------------- | ------------------------------- |
| `--divider-border` | Line colour                         | `var(--tint-90)`                |
| `--divider-stroke` | Line width (one length)             | `var(--stroke-normal)` (1px)    |
| `--divider-space`  | Outer block margin (top and bottom) | `var(--space-paragraph)` (16px) |

**Global tokens it reads:** `--tint-90`, `--stroke-normal`, `--space-paragraph`.
