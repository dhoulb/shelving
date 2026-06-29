# Mark

Highlighted text — renders a `<mark>` element to call attention to a run of text, such as a matched search term. Painted as a small inline pill with a yellow background by default.

**Things to know:**

- Use it for relevance highlighting (search hits, the current match), not for general emphasis — reach for `<Strong>` or `<Emphasis>` for that.
- It is a self-contained inline pill: it adds its own inline padding and rounded corners.
- Inside `<Prose>` a raw `<mark>` picks up the same styling, so Markdown-rendered highlights match component ones.

## Usage

### Highlighted search term

```tsx
import { Mark } from "shelving/ui";

<p>Files are stored in <Mark>UTF-8</Mark> encoding.</p>
```

## Styling

`Mark` paints from the [tint ladder](/ui/TINT_CLASS): the `50` tint sets the background and the `00` tint the text. By default the base tint resolves to `--color-yellow`; override `--mark-tint` to recolour the whole pill, or `--mark-background` / `--mark-color` to set the two faces independently.

| Variable | Styles | Default |
|---|---|---|
| `--mark-tint` | Base tint (`--tint-50`) the pill derives from | `var(--color-yellow)` |
| `--mark-background` | Background fill | `var(--tint-50)` |
| `--mark-color` | Text colour | `var(--tint-00)` |
| `--mark-padding` | Inline padding | `var(--space-xxsmall)` |
| `--mark-radius` | Corner radius | `var(--radius-xxsmall)` |
| `--mark-weight` | Font weight | `var(--weight-strong)` |

**Global tokens it reads:** `--color-yellow`, `--space-xxsmall`, `--radius-xxsmall`, `--weight-strong`, and the tint-ladder steps `--tint-50` / `--tint-00`.
