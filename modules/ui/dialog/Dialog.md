# Dialog

A native `<dialog>` element opened in modal mode. It opens via `showModal()` when mounted and includes a built-in close button, so it works equally well mounted declaratively in the tree or pushed imperatively through a `DialogsStore`.

**Things to know:**

- Closes on a backdrop click, the Escape key, any link or `<nav>` button clicked inside it, or the built-in `<DialogCloseButton>` (an X icon, top-right).
- Children render inside a `<Suspense>` boundary, so lazy content can stream in.
- Children sit in one wrapper in normal block layout, so several children stack as they would on the page. The wrapper is centred on the screen. Content taller than the screen starts at the top, and the dialog scrolls.
- `Dialog` only dims the page. Its text is white (`--tint-100`) so it reads on the dark overlay. Wrap the content in `<Modal>` to give it a panel with dark text on a light surface.
- `onClose` fires when the user closes the dialog. It must unmount the `Dialog`: clear the React state that mounts it, or (when pushed via a store) remove it from the list. `Dialog` calls `onClose` inside `startTransition()`, and the dialog stays open until it unmounts.
- The dialog animates with [view transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API). The whole dialog fades in and out as one layer. A `<Modal>` pinned to an edge takes its own layer and slides.
- A view transition only runs for a React transition update. `DialogsStore` and `onClose` do this for you. To animate a declarative `Dialog` as it opens, set the state that mounts it inside `startTransition()`.
- A browser without view transitions shows and hides the dialog at once.
- Pair with `DialogsStore`, `<DialogsContext>`, and `<Dialogs>` to open dialogs imperatively from anywhere in the app.

## Usage

### Declarative

Mount `<Dialog>` directly when its lifetime matches a React state variable.

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

// In the parent. Open inside `startTransition()` so the dialog animates in.
<button type="button" onClick={() => startTransition(() => setShowConfirm(true))}>Delete</button>
{showConfirm && <ConfirmDelete onConfirm={handleDelete} onClose={() => setShowConfirm(false)} />}
```

### Imperative

Set up the context once near the app root (see `<DialogsContext>` and `<Dialogs>`), then push a `<Dialog>` from anywhere with `requireDialogs()`.

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

`dialogs.show()` wraps the content in a `<Dialog>` for you, so you pass plain children rather than a `<Dialog>` element. It does not add a `<Modal>`; include one in the content if you want a panel.

## Styling

`Dialog` paints the full-screen overlay and resets the browser's default `<dialog>` border, size limits, and `::backdrop`. The inner panel comes from its children, usually `<Modal>`. Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--dialog-padding` | Padding around the centred content | `var(--space-normal)` (16px) |
| `--dialog-background` | Overlay fill behind the content | `var(--shadow-color)` |
| `--dialog-color` | Text colour directly on the overlay | `var(--tint-100)` (white) |
| `--dialog-close-offset` | Inset of the close button from the top-right corner | `var(--space-small)` (12px) |

The fade uses the `fade` class from `<FadeTransition>`, so `--fade-transition-duration` sets its length. It runs only as the dialog opens and closes; an open dialog stays still while other dialogs open and close.

**Global tokens it reads** — move these to retheme broadly: `--tint-100`, `--space-normal`, `--space-small`, `--shadow-color`, and `--duration-fast` (through `<FadeTransition>`).
