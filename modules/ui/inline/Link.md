# Link

An inline link or action. Delegates to `<Clickable>`, rendering an `<a>` when `href` is provided or a `<button>` when `onClick` is provided — so the same component covers both navigation and in-page actions. Prefer it over a raw `<a>` inside React components.

**Things to know:**

- It handles busy state, URL resolution, and active-page highlighting automatically via the shared `<Clickable>` helper.
- An `<a>` (any actual link) shows an underline that disappears on hover; a `<button>` variant carries no underline.
- Reach for `Link` for inline text links; for standalone calls to action use a button-styled component instead.
- Inside `<Prose>` a raw `<a>` picks up the same styling, so Markdown-rendered links match component ones.

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

`Link` drives its colour through the tint ladder, so the `color` variant (`color="purple"`, `color="red"`, …) recolours the link. By default the `50` tint resolves to the global `--color-link` token.

| Variable | Styles | Default |
|---|---|---|
| `--link-tint` | Base tint (`--tint-50`) the link colour derives from | `var(--color-link)` |
| `--link-color` | Text colour | `var(--tint-50)` |
| `--link-weight` | Font weight | `var(--weight-strong)` |

**Global tokens it reads:** `--color-link`, `--weight-strong`, and `--stroke-normal` (the underline thickness).
