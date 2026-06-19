# Mark

Highlighted text — renders a `<mark>` element to call attention to a run of text, such as a matched search term. Painted as a small inline pill with a yellow background by default.

**Things to know:**

- Use it for relevance highlighting (search hits, the current match), not for general emphasis — reach for [`<Strong>`](/ui/Strong) or [`<Emphasis>`](/ui/Emphasis) for that.
- It is a self-contained inline pill: it adds its own inline padding and rounded corners.
- Inside [`<Prose>`](/ui/Prose) a raw `<mark>` picks up the same styling, so Markdown-rendered highlights match component ones.

## Usage

### Highlighted search term

```tsx
import { Mark } from "shelving/ui";

<p>Files are stored in <Mark>UTF-8</Mark> encoding.</p>
```

## Styling

`Mark` is a fixed-palette highlight: it paints from dedicated colour hooks rather than the tint ladder.

| Variable | Styles | Default |
|---|---|---|
| `--mark-color-bg` | Background fill | `var(--light-yellow)` |
| `--mark-color-text` | Text colour | `var(--dark-yellow)` |
| `--mark-padding` | Inline padding | `0.375em` |
| `--mark-radius` | Corner radius | `var(--radius-xxsmall)` |
| `--mark-weight` | Font weight | `var(--weight-strong)` |

**Global tokens it reads:** `--light-yellow`, `--dark-yellow`, [`--radius-xxsmall`](/ui/getRadiusClass), and [`--weight-strong`](/ui/getWeightClass).
