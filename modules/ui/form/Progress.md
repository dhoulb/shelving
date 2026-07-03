# Progress

A continuous horizontal progress bar for the completion of a task. Rendered as a native `<progress>` element, so the `progressbar` role and value/max semantics come from the browser rather than hand-written ARIA.

**Things to know:**

- Use `Progress` for **task completion** — a value heading toward "done" (an upload, a multi-step form, a load). For a static reading within a range that can move up and down (disk usage, a score), a gauge is the right model, not a progress bar.
- `value` is filled within the `min`–`max` range (defaults `0`–`100`), matching `getPercent()` and `formatPercent()`. `<progress>` has no `min` attribute, so the range is normalised to `value - min` / `max - min` before it reaches the element.
- The browser clamps `value` to the `0`–`max` range, so an out-of-range `value` renders an empty or full bar rather than overspilling. A non-positive range (`min === max`) falls back to an empty bar rather than the indeterminate state.
- `aria-valuetext` carries the formatted percentage, so assistive tech announces e.g. "75%".
- `success`, `warning`, and `danger` are boolean props that recolour the fill with the matching semantic status colour.

## Usage

### Basic

```tsx
import { Progress } from "shelving/ui";

// 75% full.
<Progress value={3} max={4} />
```

### Custom range

```tsx
import { Progress } from "shelving/ui";

// 50% full — value 15 within the 10–20 range.
<Progress value={15} min={10} max={20} />
```

### Status colours

```tsx
import { Progress } from "shelving/ui";

<Progress value={90} success />
<Progress value={60} warning />
<Progress value={20} danger />
```

## Styling

`Progress` paints a track (the element / `::-webkit-progress-bar`) and a fill (`::-webkit-progress-value` / `::-moz-progress-bar`). Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--progress-height` | Bar thickness | `0.375rem` (6px) |
| `--progress-radius` | Corner radius | `999px` (pill) |
| `--progress-background` | Track fill | `var(--tint-90)` |
| `--progress-color` | Fill colour | `var(--color-blue)` |
| `--progress-success` | Fill colour when `success` is set | `var(--color-green)` |
| `--progress-warning` | Fill colour when `warning` is set | `var(--color-orange)` |
| `--progress-danger` | Fill colour when `danger` is set | `var(--color-red)` |

**Global tokens it reads** — move these to retheme broadly rather than overriding the hooks directly: the tint-ladder step `--tint-90`, the palette colours `--color-blue` / `--color-green` / `--color-orange` / `--color-red`, and `--duration-fast` (the fill's grow transition).

```css
/* Theme: a chunkier, square-cornered bar in a custom fill colour. */
:root {
  --progress-height: 0.75rem;
  --progress-radius: var(--radius-small);
  --progress-color: var(--color-purple);
}
```
