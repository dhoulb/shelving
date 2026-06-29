# Inserted

Inserted text — renders an `<ins>` element to mark content that has been added to a document, shown underlined in green by default. Prefer it over a raw `<ins>` inside React components so the semantics and class names stay consistent.

**Things to know:**

- Use `Inserted` for content genuinely added to a document (edits, diffs, new prices), and `<Deleted>` for content removed — they pair up.
- It drives its colour through the [tint ladder](/ui/TINT_CLASS), so the `color` variant (`color="purple"`, `color="blue"`, …) recolours the underline. The base tint defaults to `--color-green`.
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

`Inserted` paints from the [tint ladder](/ui/TINT_CLASS): the `50` tint sets the text colour, defaulting to `--color-green`. Override `--inserted-tint` to recolour from the base, or set each property directly.

| Variable | Styles | Default |
|---|---|---|
| `--inserted-tint` | Base tint (`--tint-50`) the colour derives from | `var(--color-green)` |
| `--inserted-color` | Text colour | `var(--tint-50)` |
| `--inserted-decoration` | Text decoration | `underline var(--stroke-normal)` |
| `--inserted-weight` | Font weight | `var(--weight-strong)` |

**Global tokens it reads:** `--color-green`, `--stroke-normal`, `--weight-strong`, and the tint-ladder step `--tint-50`.
