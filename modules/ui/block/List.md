# List

A bulleted or numbered list. Renders a `<ul>` by default (or an `<ol>` when `ordered` is set) and wraps each child in its own `<li>`, so you pass the items as children rather than writing the `<li>` markup yourself.

**Things to know:**

- Pass `ordered` to render an `<ol>` with numbered markers; the default is an unordered `<ul>`.
- Each child becomes one list item — give it plain content, not an `<li>`.
- Items are laid out as a flex column; tune the spacing between them with the `gap` variant (`<List gap="small">`).
- Like the other block components it carries its own outer block margin and collapses it when it is the first or last child of its container.
- Inside `<Prose>` a raw `<ul>` / `<ol>` picks up the same styling, so Markdown-rendered lists match component ones.

## Usage

### Unordered and ordered lists

```tsx
import { List } from "shelving/ui";

<List>{["Apples", "Oranges", "Pears"]}</List>
<List ordered>{["First", "Second", "Third"]}</List>
```

### Tighter spacing

```tsx
import { List } from "shelving/ui";

<List gap="small">{items.map(item => item.label)}</List>
```

## Styling

`List` paints from the [tint ladder](/ui/TINT_CLASS) for its markers only; rebind `--list-tint` to recolour the scope, or reach for a per-property hook for a single change.

| Variable | Styles | Default |
|---|---|---|
| `--list-tint` | Tint anchor for the list scope | `inherit` (flows from `color=` / parent) |
| `--list-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |
| `--list-gap` | Space between items | `var(--space-xsmall)` |
| `--list-indent` | Inline start padding (marker gutter) | `1.125em` unordered / `1.8em` ordered |
| `--list-marker-color` | Bullet / number colour | `var(--tint-80)` |

**Global tokens it reads:** `--space-paragraph`, `--space-xsmall`, and the tint-ladder step `--tint-80`. The `gap` variant comes from the shared `shelving/ui` styling system.
