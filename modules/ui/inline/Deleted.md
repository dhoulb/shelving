# Deleted

Deleted text — renders a `<del>` element to mark content that has been removed from a document, shown struck through in red by default. Prefer it over a raw `<del>` inside React components so the semantics and class names stay consistent.

**Things to know:**

- Use `Deleted` for content genuinely removed from a document (edits, diffs, retired prices), and `<Inserted>` for content added — they pair up.
- It drives its colour through the [tint ladder](/ui/TINT_CLASS), so the `color` variant (`color="purple"`, `color="orange"`, …) recolours the strike-through. The base tint defaults to `--color-red`.
- Inside `<Prose>` a raw `<del>` picks up the same styling, so Markdown-rendered deletions match component ones.

## Usage

### Marking a removed value

```tsx
import { Paragraph, Deleted, Inserted } from "shelving/ui";

<Paragraph>
  Was <Deleted>$50</Deleted> <Inserted>$35</Inserted>.
</Paragraph>
```

## Styling

`Deleted` paints from the [tint ladder](/ui/TINT_CLASS): the `50` tint sets the text colour, defaulting to `--color-red`. Override `--deleted-tint` to recolour from the base, or set each property directly.

| Variable | Styles | Default |
|---|---|---|
| `--deleted-tint` | Base tint (`--tint-50`) the colour derives from | `var(--color-red)` |
| `--deleted-color` | Text colour | `var(--tint-50)` |
| `--deleted-decoration` | Text decoration | `line-through var(--stroke-normal)` |
| `--deleted-weight` | Font weight | `var(--weight-strong)` |

**Global tokens it reads:** `--color-red`, `--stroke-normal`, `--weight-strong`, and the tint-ladder step `--tint-50`.
