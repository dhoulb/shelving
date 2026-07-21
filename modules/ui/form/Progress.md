# Progress

A continuous horizontal progress bar for the completion of a task. Rendered as a native `<progress>` element, so the `progressbar` role and value/max semantics come from the browser rather than hand-written ARIA.

**Things to know:**

- Use `Progress` for **task completion** — a value heading toward "done" (an upload, a multi-step form, a load). For a static reading within a range that can move up and down (disk usage, a score), a gauge is the right model, not a progress bar.
- `value` is filled within the `min`–`max` range (defaults `0`–`100`), matching `getPercent()` and `formatPercent()`. `<progress>` has no `min` attribute, so the range is normalised to `value - min` / `max - min` before it reaches the element.
- The browser clamps `value` to the `0`–`max` range, so an out-of-range `value` renders an empty or full bar rather than overspilling. A non-positive range (`min === max`) falls back to an empty bar rather than the indeterminate state.
- Omit `value` (or pass `null`/`undefined`) for an ongoing task whose duration isn't known — exactly like a native `<progress>`, dropping the attribute switches the element into the `:indeterminate` state (no `aria-valuenow`), and a block of fill colour flows across the track on a loop. `color=` / `status=` still recolour it. The animation runs even under `prefers-reduced-motion` — movement is the indeterminate bar's only signal, and a frozen block would read as a stalled bar.
- `aria-valuetext` carries the formatted percentage, so assistive tech announces e.g. "75%".
- Paints from the [tint ladder](/ui/TINT_CLASS): `color=` and `status=` move the tint anchor for the bar, so the fill (and track) re-derive together — `status="success"` gives a green bar, `color="purple"` a purple one. Without either, the bar takes the ambient tint (`--tint-50`, gray by default).

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

### Status and colour

```tsx
import { Progress } from "shelving/ui";

<Progress value={90} status="success" />
<Progress value={20} status="danger" />
<Progress value={60} color="purple" />
```

### Indeterminate

```tsx
import { Progress } from "shelving/ui";

// No `value` → looping flow animation for a task of unknown duration.
<Progress />

// The flowing block still picks up status/colour.
<Progress status="success" />
```

## Styling

`Progress` paints a track (the element / `::-webkit-progress-bar`) and a fill (`::-webkit-progress-value` / `::-moz-progress-bar`) from the [tint ladder](/ui/TINT_CLASS). Apply `color=` / `status=` (on the bar or a tinted ancestor scope) to recolour the fill and track together — reach for a per-property hook only for a single surgical change. Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--progress-height` | Bar thickness | `0.375rem` (6px) |
| `--progress-radius` | Corner radius | `999px` (pill) |
| `--progress-background` | Track fill | `var(--tint-90)` |
| `--progress-color` | Fill colour | `var(--tint-50)` |
| `--progress-duration` | Indeterminate flow-loop duration | `1.5s` |

**Global tokens it reads** — move these to retheme broadly rather than overriding the hooks directly: the tint-ladder steps `--tint-50` (fill) and `--tint-90` (track), plus `--duration-fast` (the fill's grow transition). To recolour a bar, prefer `color=` / `status=` (or a tinted ancestor scope) over the per-component hooks.

```css
/* Theme: a chunkier, square-cornered bar. */
:root {
  --progress-height: 0.75rem;
  --progress-radius: var(--radius-small);
}
```
