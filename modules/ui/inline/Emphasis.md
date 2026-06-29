# Emphasis

Emphasised text — renders an `<em>` element for stress emphasis, the kind that changes the meaning of a sentence (typically shown italic). Prefer it over a raw `<em>` or `<i>` inside React components so the semantics and class names stay consistent.

**Things to know:**

- Use `Emphasis` for stress emphasis (italic), `<Strong>` for importance (bold), and `<Mark>` for relevance highlighting — they are not interchangeable.
- It only sets the font style; it inherits colour, weight, and size from the surrounding text.
- Inside `<Prose>` raw `<em>` / `<i>` pick up the same styling, so Markdown-rendered emphasis matches component ones.

## Usage

### Stress emphasis in body copy

```tsx
import { Paragraph, Emphasis } from "shelving/ui";

<Paragraph>
  You were meant to turn <Emphasis>left</Emphasis>.
</Paragraph>
```

## Styling

`Emphasis` only sets its font style and inherits everything else from its surroundings.

| Variable | Styles | Default |
|---|---|---|
| `--emphasis-style` | Font style | `italic` |
