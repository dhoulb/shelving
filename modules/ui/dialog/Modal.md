# Modal

The panel inside a `<Dialog>`. `<Dialog>` dims the page; `Modal` gives the content a bordered, shadowed surface with dark text on a light fill.

**Things to know:**

- A native `<dialog>` does both jobs. Shelving splits them: `<Dialog>` is the overlay and `Modal` is the panel. Content placed directly in a `<Dialog>` shows as white text on the dark overlay.
- `Modal` sets its text back to `--tint-00`, so it reads on its own `--tint-100` surface.
- `DialogsStore.show()` wraps its content in a `<Dialog>` only. It does not add a `Modal`, so put the `Modal` in the content yourself.
- `Modal` only styles the box. Lay out its contents with the usual block components.

## Usage

### Declarative

Put the `Modal` inside a `<Dialog>` that you mount from React state.

```tsx
import { Dialog, Modal } from "shelving/ui";

function ConfirmDelete({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <Dialog onClose={onClose}>
      <Modal>
        <p>Delete this item?</p>
        <button type="button" onClick={onConfirm}>Delete</button>
      </Modal>
    </Dialog>
  );
}
```

### Imperative

Pass the `Modal` to `DialogsStore.show()`. The store adds the `<Dialog>` for you. See `<DialogsContext>` and `<Dialogs>` for the setup.

```tsx
import { Modal, requireDialogs } from "shelving/ui";

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const dialogs = requireDialogs();
  const open = () =>
    dialogs.show(
      <Modal>
        <p>Delete this item?</p>
        <button type="button" onClick={onConfirm}>Delete</button>
      </Modal>,
    );
  return <button type="button" onClick={open}>Delete</button>;
}
```

## Styling

`Modal` paints a bordered, shadowed surface. Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--modal-width` | Box width | `var(--width-narrow)` |
| `--modal-border` | Border shorthand | `var(--stroke-normal)` solid, 50% of `--tint-50` |
| `--modal-radius` | Corner radius | `var(--radius-normal)` (16px) |
| `--modal-background` | Surface fill | `var(--tint-100)` |
| `--modal-padding` | Inner padding | `var(--space-normal)` (16px) |
| `--modal-color` | Text colour | `var(--tint-00)` |
| `--modal-transition` | Transition | `all var(--duration-fast)` (150ms) |
| `--modal-shadow` | Drop shadow | `var(--shadow-normal)` |

**Global tokens it reads** — move these to retheme broadly: the tint ladder `--tint-00` / `--tint-50` / `--tint-100`, plus `--width-narrow`, `--space-normal`, `--radius-normal`, `--stroke-normal`, `--shadow-normal`, and `--duration-fast`.
