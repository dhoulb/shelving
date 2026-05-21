# Inline content

Inline-level components for annotating text. Every component here renders a single semantic HTML element — `<Strong>` renders `<strong>`, `<Code>` renders `<code>`, `<Mark>` renders `<mark>` — and applies the matching design-system styles.

## Concepts

### Semantic wrappers

These components exist so that text annotations always carry the correct HTML semantics and class names. Prefer them over raw HTML elements inside React components: `<Strong>` instead of `<strong>`, `<Link href="…">` instead of `<a href="…">`.

### Code family

`Code.tsx` exports four components that all share the same monospace styling:

| Component  | HTML element | Use for                         |
| ---------- | ------------ | ------------------------------- |
| `Code`     | `<code>`     | Inline code fragments           |
| `Keyboard` | `<kbd>`      | Keyboard input, e.g. `Ctrl+S`  |
| `Sample`   | `<samp>`     | Program output                  |
| `Variable` | `<var>`      | Variable names in documentation |

### `<Link>` delegates to `<Clickable>`

`<Link>` renders an `<a>` when `href` is provided or a `<button>` when `onClick` is provided, via the shared `Clickable` helper. It handles busy state, URL resolution, and active-page highlighting automatically.

### `<When>`, `<Ago>`, `<Until>` — time display

These components format a date as a compact relative string (`in 6d`, `3w ago`) and wrap it in a `<time>` element with a machine-readable `dateTime` attribute and a `title` showing the full date. Pass `full` to append the absolute date alongside the relative one.

- `When` — shows direction: `in 6d` or `3w ago`
- `Ago` — always backward-looking duration: `6d`
- `Until` — always forward-looking duration: `6d`

## Canonical usage examples

### Annotated paragraph

```tsx
import { Strong, Emphasis, Mark, Keyboard, Code, Small } from "shelving/ui";

<p>
  Press <Keyboard>Ctrl+S</Keyboard> to save. <Strong>Unsaved changes will be lost.</Strong>{" "}
  Files are stored as <Emphasis>plain text</Emphasis> in{" "}
  <Mark>UTF-8</Mark> encoding. <Small>Maximum 10 MB.</Small>
</p>
```

Use `<Keyboard>` for key combinations, `<Code>` for inline code fragments, and `<Sample>` for program output — they share the same monospace appearance but carry different semantics.

### Link inside body copy

```tsx
import { Link } from "shelving/ui";

<p>
  Read our <Link href="/privacy">privacy policy</Link> for details.
</p>
```

### Relative timestamp

```tsx
import { When, Until } from "shelving/ui";

// "in 3d" or "5h ago" with full ISO date as title tooltip
<span>Last updated <When target={post.updatedAt} /></span>

// Just the forward-looking duration: "in 2w"
<span>Expires <Until target={subscription.expiresAt} /></span>
```

### Change tracking

```tsx
import { Deleted, Inserted } from "shelving/ui";

<p>
  Price: <Deleted>£9.99</Deleted> <Inserted>£7.99</Inserted>
</p>
```

## See also

- [ui/block](/ui/block) — block-level content components that inline components live inside
- [ui/block/Prose](/ui/block) — applies cohesive longform typography to a subtree of block and inline elements
- [ui/form/Clickable](/ui/form) — the underlying clickable primitive that `Link` delegates to
