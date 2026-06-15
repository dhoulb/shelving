# Dialog

A native `<dialog>` element opened in modal mode. It opens via `showModal()` when mounted and includes a built-in close button, so it works equally well mounted declaratively in the tree or pushed imperatively through a [`DialogsStore`](/ui/DialogsStore).

**Things to know:**

- Closes on a backdrop click, on any link or `<nav>` button clicked inside it, or via the built-in [`DialogCloseButton`](/ui/DialogCloseButton) (an X icon, top-right).
- Children render inside a `<Suspense>` boundary, so lazy content can stream in.
- `onClose` fires when the dialog closes — use it to clear the React state that mounts the dialog, or (when pushed via a store) to remove it from the list.
- Pair with [`DialogsStore`](/ui/DialogsStore), [`DialogsContext`](/ui/DialogsContext), and [`Dialogs`](/ui/Dialogs) to open dialogs imperatively from anywhere in the app. For a non-blocking persistent overlay, reach for [`Modal`](/ui/Modal) instead.

## Usage

### Declarative

Mount `<Dialog>` directly when its lifetime matches a React state variable.

```tsx
import { Dialog, DialogCloseButton } from "shelving/ui";

function ConfirmDelete({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <Dialog onClose={onClose}>
      <p>Delete this item?</p>
      <button type="button" onClick={onConfirm}>Delete</button>
      <DialogCloseButton />
    </Dialog>
  );
}

// In the parent:
{showConfirm && <ConfirmDelete onConfirm={handleDelete} onClose={() => setShowConfirm(false)} />}
```

### Imperative

Set up the context once near the app root (see [`DialogsContext`](/ui/DialogsContext) and [`Dialogs`](/ui/Dialogs)), then push a `<Dialog>` from anywhere with [`requireDialogs()`](/ui/requireDialogs).

```tsx
import { requireDialogs } from "shelving/ui";

function DeleteButton({ id }: { id: string }) {
  const dialogs = requireDialogs();
  const open = () => dialogs.show(
    <ConfirmDelete id={id} onConfirm={() => handleDelete(id)} />,
  );
  return <button type="button" onClick={open}>Delete</button>;
}
```

`dialogs.show()` wraps the content in a `<Dialog>` for you, so you pass plain children rather than a `<Dialog>` element.

## Styling

`Dialog` paints the full-screen overlay; the inner panel is laid out by its children. Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--dialog-padding` | Padding around the centred content | `var(--space-normal)` (16px) |
| `--dialog-color-overlay` | Backdrop fill behind the content | `var(--color-shadow)` |
| `--dialog-transition` | Open / close transition | `all var(--duration-fast)` (150ms) |
| `--dialog-close-offset` | Inset of the close button from the top-right corner | `var(--space-small)` (8px) |

**Global tokens it reads** — move these to retheme broadly: [`--space-normal`](/ui/getSpaceClass), [`--space-small`](/ui/getSpaceClass), [`--color-shadow`](/ui/getColorClass), and [`--duration-fast`](/ui/getDurationClass).

## See also

- [`Modal`](/ui/Modal) — a non-blocking `<aside>` overlay for persistent panels.
- [`DialogsStore`](/ui/DialogsStore) — push dialogs imperatively; `.show()` and `.hideAll()`.
- [`DialogsContext`](/ui/DialogsContext) / [`Dialogs`](/ui/Dialogs) — provide a store and render its open dialogs.
- [`notice`](/ui) — inline and global notices (toasts, banners).
- [`form`](/ui) — form components to put inside dialogs.
- [`transition`](/ui) — animate dialog enter / leave.
