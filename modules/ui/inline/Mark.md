# Mark

Highlighted text — renders a `<mark>` element to call attention to a run of text, such as a matched search term. Painted as a small inline pill with a translucent yellow background by default.

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

`Mark` highlights with a translucent wash of `--color-yellow` — `color-mix(…, transparent)`, so the text underneath stays legible — with the text painted from `--tint-00`. Override `--mark-tint` to change the highlight hue, `--mark-background` to replace the fill outright, or `--mark-color` for the text.

| Variable | Styles | Default |
|---|---|---|
| `--mark-tint` | Highlight hue, mixed 50% with `transparent` for the background | `var(--color-yellow)` |
| `--mark-background` | Background fill | `color-mix(in oklch, var(--mark-tint, var(--color-yellow)), transparent)` |
| `--mark-color` | Text colour | `var(--tint-00)` |
| `--mark-padding` | Inline padding | `var(--space-xxsmall)` |
| `--mark-radius` | Corner radius | `var(--radius-xxsmall)` |
| `--mark-weight` | Font weight | `var(--weight-strong)` |

**Global tokens it reads:** `--color-yellow`, `--space-xxsmall`, `--radius-xxsmall`, `--weight-strong`, and the tint-ladder step `--tint-00`.
