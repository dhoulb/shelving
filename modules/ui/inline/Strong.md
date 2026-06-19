# Strong

Strong importance — renders a `<strong>` element for text that carries strong importance, seriousness, or urgency (typically shown bold). Prefer it over a raw `<strong>` or `<b>` inside React components so the semantics and class names stay consistent.

**Things to know:**

- Use `Strong` for importance, [`<Emphasis>`](/ui/Emphasis) for stress emphasis (italic), and [`<Mark>`](/ui/Mark) for relevance highlighting — they are not interchangeable.
- It only sets the font weight; it inherits colour and size from the surrounding text.
- Inside [`<Prose>`](/ui/Prose) raw `<strong>` / `<b>` pick up the same styling, so Markdown-rendered bold text matches component ones.

## Usage

### Strong importance in body copy

```tsx
import { Paragraph, Strong } from "shelving/ui";

<Paragraph>
  Press save before leaving. <Strong>Unsaved changes will be lost.</Strong>
</Paragraph>
```

## Styling

`Strong` has no own theming hooks — it sets `font-weight: var(--weight-strong)` and inherits everything else from its surroundings.

**Global tokens it reads:** [`--weight-strong`](/ui/getWeightClass).
