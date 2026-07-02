# Inserted

Inserted text — renders an `<ins>` element to mark content that has been added to a document, shown underlined in green by default. Prefer it over a raw `<ins>` inside React components so the semantics and class names stay consistent.

**Things to know:**

- Use `Inserted` for content genuinely added to a document (edits, diffs, new prices), and `<Deleted>` for content removed — they pair up.
- It colours itself directly from `--color-green` rather than the tint ladder, so an insertion stays a consistent green even inside a tinted region; change it with `--inserted-color`.
- Inside `<Prose>` a raw `<ins>` picks up the same styling, so Markdown-rendered insertions match component ones.

## Usage

### Marking an added value

```tsx
import { Paragraph, Deleted, Inserted } from "shelving/ui";

<Paragraph>
  Was <Deleted>$50</Deleted> <Inserted>$35</Inserted>.
</Paragraph>
```

## Styling

`Inserted` colours its text directly from `--color-green` (not the tint ladder), so insertions stay a consistent green regardless of the surrounding tint. Override `--inserted-color` to recolour.

| Variable | Styles | Default |
|---|---|---|
| `--inserted-color` | Text colour | `var(--color-green)` |
| `--inserted-decoration` | Text decoration | `underline var(--stroke-normal)` |
| `--inserted-weight` | Font weight | `var(--weight-strong)` |

**Global tokens it reads:** `--color-green`, `--stroke-normal`, and `--weight-strong`.
