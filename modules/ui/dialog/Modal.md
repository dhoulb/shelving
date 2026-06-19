# Modal

A non-blocking `<aside>` overlay for persistent panels — drawers, toasts, and side-sheets that coexist with the page rather than blocking interaction with it. Unlike [`<Dialog>`](/ui/Dialog), it is not a native `<dialog>` and does not trap focus or dim the page.

**Things to know:**

- Reach for `Modal` when the overlay should sit alongside the page (a notification panel, a side drawer); reach for [`<Dialog>`](/ui/Dialog) when it should block interaction until dismissed.
- It only styles the box — lay out its contents with the usual block components.

## Usage

```tsx
import { Modal } from "shelving/ui";

<Modal>
  <NotificationPanel />
</Modal>
```

## Styling

`Modal` paints a bordered, shadowed surface. Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--modal-width` | Box width | `var(--width-narrow)` |
| `--modal-border` | Border shorthand | `var(--stroke-normal)` solid, 50% of [`--tint-50`](/ui/TINT_CLASS) |
| `--modal-radius` | Corner radius | `var(--radius-normal)` (16px) |
| `--modal-color-bg` | Surface fill | `var(--tint-100)` |
| `--modal-padding` | Inner padding | `var(--space-normal)` (16px) |
| `--modal-color-text` | Text colour | `var(--tint-00)` |
| `--modal-transition` | Transition | `all var(--duration-fast)` (150ms) |
| `--modal-shadow` | Drop shadow | `var(--shadow-normal)` |

**Global tokens it reads** — move these to retheme broadly: the tint ladder [`--tint-00`](/ui/TINT_CLASS) / [`--tint-50`](/ui/TINT_CLASS) / [`--tint-100`](/ui/TINT_CLASS), plus [`--width-narrow`](/ui/getWidthClass), [`--space-normal`](/ui/getSpaceClass), [`--radius-normal`](/ui/getRadiusClass), [`--stroke-normal`](/ui/getStrokeClass), [`--shadow-normal`](/ui/getShadowClass), and [`--duration-fast`](/ui/getDurationClass).
