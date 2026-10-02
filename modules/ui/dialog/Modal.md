# Modal

The panel inside a `<Dialog>`. `<Dialog>` dims the page; `Modal` gives the content a bordered, shadowed surface with dark text on a light fill.

**Things to know:**

- A native `<dialog>` does both jobs. Shelving splits them: `<Dialog>` is the overlay and `Modal` is the panel. Content placed directly in a `<Dialog>` shows as white text on the dark overlay.
- `Modal` sets its text back to `--tint-00`, so it reads on its own `--tint-100` surface.
- It only styles the box — lay out its contents with the usual block components.

## Usage

```tsx
import { Dialog, Modal } from "shelving/ui";

<Dialog onClose={onClose}>
  <Modal>
    <p>Delete this item?</p>
  </Modal>
</Dialog>
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
