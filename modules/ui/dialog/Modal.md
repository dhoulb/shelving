# Modal

The panel inside a `<Dialog>`. `<Dialog>` dims the page; `Modal` gives the content a shadowed surface with dark text on a light fill.

**Things to know:**

- A native `<dialog>` does both jobs. Shelving splits them: `<Dialog>` is the overlay and `Modal` is the panel. Content placed directly in a `<Dialog>` shows as white text on the dark overlay.
- `Modal` sets its text back to `--tint-00`, so it reads on its own `--tint-100` surface.
- `DialogsStore.show()` wraps its content in a `<Dialog>` only. It does not add a `Modal`, so put the `Modal` in the content yourself.
- `Modal` only styles the box. Lay out its contents with the usual block components.
- Set `top`, `right`, `bottom`, or `left` to pin the panel to that edge of the screen. A top or bottom panel is full width; a left or right panel is full height. Use these for mobile menus, bottom sheets, and side menus.
- A centred panel fades in and out with its `<Dialog>`. A pinned panel slides in from its edge and out to it, in its own view-transition layer. With reduced motion, a pinned panel fades in place.

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

### Pinned to an edge

```tsx
import { Menu, MenuItem, Modal, requireDialogs } from "shelving/ui";

function MenuButton() {
  const dialogs = requireDialogs();
  const open = () =>
    dialogs.show(
      <Modal left>
        <Menu>
          <MenuItem href="/">Home</MenuItem>
          <MenuItem href="/settings">Settings</MenuItem>
        </Menu>
      </Modal>,
    );
  return <button type="button" onClick={open}>Menu</button>;
}
```

A link click inside a `<Dialog>` closes it, so the menu slides out as the page changes. Use `<Modal bottom>` for a bottom sheet on mobile.

## Styling

`Modal` paints a shadowed surface with no border. Set `--modal-border` to add one; a pinned panel then keeps only the border on its inner side. On a pinned panel, only the corners that do not touch a screen edge are round. Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--modal-width` | Box width | `var(--width-narrow)` |
| `--modal-border` | Border shorthand. Set it to add a border, for example `var(--stroke-normal) solid var(--tint-80)` | `none` |
| `--modal-radius` | Corner radius | `var(--radius-normal)` (16px) |
| `--modal-background` | Surface fill | `var(--tint-100)` |
| `--modal-padding` | Inner padding | `var(--space-normal)` (16px) |
| `--modal-color` | Text colour | `var(--tint-00)` |
| `--modal-max-height` | Maximum height of a `top` or `bottom` panel (it scrolls past this) | `100%` |
| `--modal-transition-duration` | Length of the slide for a pinned panel. Keep it the same as `--fade-transition-duration`, so the panel and the `<Dialog>` overlay finish together | `var(--duration-fast)` (150ms) |
| `--modal-shadow` | Drop shadow | `var(--shadow-normal)` |

**Global tokens it reads** — move these to retheme broadly: the tint ladder `--tint-00` / `--tint-100`, plus `--width-narrow`, `--space-normal`, `--radius-normal`, `--shadow-normal`, and `--duration-fast`.
