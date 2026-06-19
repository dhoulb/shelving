# Modal

A non-blocking `<aside>` overlay for persistent panels — drawers, toasts, and side-sheets that coexist with the page rather than blocking interaction with it. Unlike `<Dialog>`, it is not a native `<dialog>` and does not trap focus or dim the page.

**Things to know:**

- Reach for `Modal` when the overlay should sit alongside the page (a notification panel, a side drawer); reach for `<Dialog>` when it should block interaction until dismissed.
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
| `--modal-border` | Border shorthand | `var(--stroke-normal)` solid, 50% of `--tint-50` |
| `--modal-radius` | Corner radius | `var(--radius-normal)` (16px) |
| `--modal-color-bg` | Surface fill | `var(--tint-100)` |
| `--modal-padding` | Inner padding | `var(--space-normal)` (16px) |
| `--modal-color-text` | Text colour | `var(--tint-00)` |
| `--modal-transition` | Transition | `all var(--duration-fast)` (150ms) |
| `--modal-shadow` | Drop shadow | `var(--shadow-normal)` |

**Global tokens it reads** — move these to retheme broadly: the tint ladder `--tint-00` / `--tint-50` / `--tint-100`, plus `--width-narrow`, `--space-normal`, `--radius-normal`, `--stroke-normal`, `--shadow-normal`, and `--duration-fast`.
