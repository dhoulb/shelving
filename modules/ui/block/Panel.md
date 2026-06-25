# Panel

A full-width vertical region that paints the current surface colour. Use panels to break a page into stacked bands: each one butts against its neighbours (zero block margin) but carries generous vertical padding, so a page becomes a sequence of coloured sections.

**Things to know:**

- A panel always spans the full width of its container. To constrain the content inside, compose a `<Block>` `width="narrow"` (or `width="wide"`) within it.
- Block margin is always zero so panels stack flush; control the vertical breathing room with the `padding` variant (`<Panel padding="large">`, `<Panel padding="none">`).
- Inline padding ("indent") keeps content off the edges by default. Override it per-property with `--panel-indent`, or change it with the shared `indent` variant (`<Panel indent="large">`, `<Panel indent="none">`).
- `color=` / `status=` move the tint anchor for the whole panel scope, so the surface, border, and text re-derive together and cascade into nested content.
- The top and bottom borders are dropped on the first and last panel so the page doesn't gain stray edge lines.

## Usage

### Page banded into panels

```tsx
import { Panel, Block, Title, Paragraph } from "shelving/ui";

<Panel as="header" color="primary">
  <Block width="narrow">
    <Title>Welcome</Title>
  </Block>
</Panel>
<Panel padding="large">
  <Block width="narrow">
    <Paragraph>Each panel is a full-width band; the inner block constrains the content.</Paragraph>
  </Block>
</Panel>
```

## Styling

`Panel` paints from the [tint ladder](/ui/TINT_CLASS); rebind `--panel-tint` to recolour the whole scope at once, or reach for a per-property hook for a single change.

| Variable | Styles | Default |
|---|---|---|
| `--panel-tint` | Tint anchor for the panel scope — recolours surface, border, and text together | `inherit` (flows from `color=` / `status=` / parent) |
| `--panel-background` | Surface fill | `var(--tint-90)` |
| `--panel-color` | Text colour | `var(--tint-00)` |
| `--panel-border` | Top/bottom border shorthand | `var(--panel-stroke) solid var(--tint-80)` |
| `--panel-stroke` | Border thickness | `var(--stroke-normal)` (2px) |
| `--panel-padding` | Block padding (top + bottom) | `var(--space-section)` (2rem) |
| `--panel-indent` | Inline padding (left + right) keeping content off the edges | `var(--space-normal)` (16px) |

**Global tokens it reads:** the tint-ladder steps `--tint-00` / `--tint-80` / `--tint-90`, plus `--stroke-normal`, `--space-section`, and `--space-normal`. The shared `padding` variant overrides `--panel-padding`; the shared `indent` variant overrides `--panel-indent`.
