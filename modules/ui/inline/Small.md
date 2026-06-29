# Small

Small print — renders a `<small>` element for side comments and fine print such as disclaimers, attributions, and legal notes. Prefer it over a raw `<small>` inside React components so the semantics and class names stay consistent.

**Things to know:**

- It signals fine print semantically; it keeps the surrounding font size and weight, only muting the colour to a lighter tint step (`--tint-70`). Reach for the `size` typography variant if you also want smaller text.
- Inside `<Prose>` a raw `<small>` picks up the same styling, so Markdown-rendered fine print matches component ones.

## Usage

### Fine print after a statement

```tsx
import { Paragraph, Small } from "shelving/ui";

<Paragraph>
  Upgrade any time. <Small>Terms apply.</Small>
</Paragraph>
```

## Styling

`Small` mutes its text colour to a lighter tint step and inherits size and weight from its surroundings.

| Variable | Styles | Default |
|---|---|---|
| `--small-color` | Text colour | `var(--tint-70)` |

**Global tokens it reads:** the tint-ladder step `--tint-70`.
