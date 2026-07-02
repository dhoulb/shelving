# Deleted

Deleted text — renders a `<del>` element to mark content that has been removed from a document, shown struck through in red by default. Prefer it over a raw `<del>` inside React components so the semantics and class names stay consistent.

**Things to know:**

- Use `Deleted` for content genuinely removed from a document (edits, diffs, retired prices), and `<Inserted>` for content added — they pair up.
- It colours itself directly from `--color-red` rather than the tint ladder, so a deletion stays a consistent red even inside a tinted region; change it with `--deleted-color`.
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

`Deleted` colours its text directly from `--color-red` (not the tint ladder), so deletions stay a consistent red regardless of the surrounding tint. Override `--deleted-color` to recolour.

| Variable | Styles | Default |
|---|---|---|
| `--deleted-color` | Text colour | `var(--color-red)` |
| `--deleted-decoration` | Text decoration | `line-through var(--stroke-normal)` |
| `--deleted-weight` | Font weight | `var(--weight-strong)` |

**Global tokens it reads:** `--color-red`, `--stroke-normal`, and `--weight-strong`.
