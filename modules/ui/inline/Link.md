# Link

An inline link or action. Delegates to [`Clickable`](/ui/Clickable), rendering an `<a>` when `href` is provided or a `<button>` when `onClick` is provided — so the same component covers both navigation and in-page actions. Prefer it over a raw `<a>` inside React components.

**Things to know:**

- It handles busy state, URL resolution, and active-page highlighting automatically via the shared `Clickable` helper.
- An `<a>` (any actual link) shows an underline that disappears on hover; a `<button>` variant carries no underline.
- Reach for `Link` for inline text links; for standalone calls to action use a button-styled component instead.
- Inside [`Prose`](/ui/Prose) a raw `<a>` picks up the same styling, so Markdown-rendered links match component ones.

## Usage

### Link inside body copy

```tsx
import { Paragraph, Link } from "shelving/ui";

<Paragraph>
  Read our <Link href="/privacy">privacy policy</Link> for details.
</Paragraph>
```

### Action button

```tsx
import { Link } from "shelving/ui";

<Link onClick={() => save()}>Save now</Link>
```

## Styling

`Link` exposes a couple of inline hooks; the link colour comes from the global [`--color-link`](/ui/getColorClass) token.

| Variable | Styles | Default |
|---|---|---|
| `--link-weight` | Text colour and font weight | `var(--color-link)` colour / `var(--weight-strong)` weight |

**Global tokens it reads:** [`--color-link`](/ui/getColorClass), [`--weight-strong`](/ui/getWeightClass), and [`--stroke-normal`](/ui/getStrokeClass) (the underline thickness).

## See also

- [`Clickable`](/ui/Clickable) — the underlying primitive that renders `<a>` vs `<button>`.
- [`Strong`](/ui/Strong) — emphasis for runs of text that are not links.
- [`Prose`](/ui/Prose) — styles raw `<a>` inside longform content.
- [`ui`](/ui) — the styling system and theming tokens.
