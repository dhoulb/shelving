# Dialog

- Kind: component
- Import: `import { Dialog } from "shelving/ui";`

Modal `<dialog>` element that opens on mount and includes a close button.

- Opens via `showModal()` when mounted, and closes on a tap anywhere on it, the close button, or the Escape key.
- A tap on a control (button, input, select, textarea, label) or inside a `<Modal>` panel does not close it. A tap on a link or a `<nav>` button always closes it.
- It knows nothing about transitions. It fades in and out only when the update that mounts or unmounts it is a transition, e.g. from `<Dialogs>` or your own `startTransition()`. A `<Modal>` pinned to an edge then slides in its own layer.
- A change inside an open dialog (new content, a Suspense reveal) runs no view transition. The page ignores taps while one runs.
- With `onClose`, it is declarative: a close request calls `onClose()`, and the dialog stays open until it unmounts, so a view transition can capture it as it leaves.
- Children sit in one wrapper in normal block layout, `--dialog-width` wide and centred on the screen. Content taller than the screen scrolls from its top.
- Wraps content in `<Suspense>` so lazy children can stream in.

A native `<dialog>` element opened in modal mode. It opens via `showModal()` when mounted and includes a built-in close button, so it works equally well mounted declaratively in the tree or pushed imperatively through a `DialogsStore`.

**Things to know:**

- Closes on a tap anywhere on it, the Escape key, or the built-in `<DialogCloseButton>` (an X icon, top-right).
- A tap on a control (`<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`) does not close it. A tap anywhere inside a `<Modal>` panel does not close it either, so a form in a `<Modal>` is safe. A tap on a link or a `<nav>` button always closes it.
- Children render inside a `<Suspense>` boundary, so lazy content can stream in.
- Children sit in one wrapper in normal block layout, so several children stack as they would on the page. The wrapper is `--dialog-width` wide (never wider than the screen) and centred on the screen. A centred `<Modal>` fills it. Content taller than the screen starts at the top, and the dialog scrolls.
- While a dialog is open, the page behind it does not scroll. A scroll inside the dialog never passes on to the page.
- `Dialog` only dims the page. Its text is white (`--tint-100`) so it reads on the dark overlay. Wrap the content in `<Modal>` to give it a panel with dark text on a light surface.
- `Dialog` is declarative. While it is mounted, it is open. When the user asks to close it, it calls `onClose` and stays open until it unmounts. `onClose` must unmount it: clear the React state that mounts it, or (when pushed via a store) remove it from the list.
- To close a dialog from your own code, call `requestDialogClose()` on the `<dialog>` element, not `dialog.close()`. `requestDialogClose()` goes through `onClose` like the Escape key, so the dialog can animate out. `dialog.close()` closes it at once. A successful `<Form>` submit inside a dialog uses `requestDialogClose()`.
- The dialog can animate with [view transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API). The whole dialog fades in and out as one layer. A `<Modal>` pinned to an edge takes its own layer and slides.
- A change inside an open dialog (new content, a Suspense reveal) runs no view transition, so the dialog never ignores a tap while its content changes. The page ignores taps while a view transition runs.
- `Dialog` knows nothing about transitions. React runs a view transition only for an update made inside `startTransition()`, so the code that mounts and unmounts the dialog decides if it animates:
  - `<Dialogs>` renders a `DialogsStore` inside transitions, so a dialog opened with `DialogsStore.show()` animates in and out for you.
  - A `Dialog` you mount yourself appears and goes at once, unless you set the state that mounts and unmounts it inside `startTransition()`. See the declarative example below.
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

// In the parent. Open and close inside `startTransition()` so the dialog animates in and out.
<button type="button" onClick={() => startTransition(() => setShowConfirm(true))}>Delete</button>
{showConfirm && <ConfirmDelete onConfirm={handleDelete} onClose={() => startTransition(() => setShowConfirm(false))} />}
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

`dialogs.show()` wraps the content in a `<Dialog>` for you, so you pass plain children rather than a `<Dialog>` element. It does not add a `<Modal>`; include one in the content if you want a panel. `<Dialogs>` renders the list inside transitions, so the dialog animates in and out with no `startTransition()` of your own.

## Styling

`Dialog` paints the full-screen overlay and resets the browser's default `<dialog>` border, size limits, and `::backdrop`. Transparent borders as wide as the screen's safe areas keep the content and the close button clear of the notch, rounded corners and home bar. The inner panel comes from its children, usually `<Modal>`. Override these hooks at `:root` (or any ancestor scope) to retheme.

| Variable | Styles | Default |
|---|---|---|
| `--dialog-padding` | Top and bottom padding around the centred content (one length) | `var(--space-normal)` (16px) |
| `--dialog-indent` | Left and right padding around the centred content (one length) | `var(--space-normal)` (16px) |
| `--dialog-width` | Width of the centred content, and so of a centred `<Modal>` | `var(--width-narrow)` (36rem) |
| `--dialog-background` | Overlay fill behind the content | `var(--color-backdrop)` |
| `--dialog-color` | Text colour directly on the overlay | `var(--tint-100)` (white) |
| `--dialog-close-offset` | Inset of the close button from the top-right corner | `var(--space-small)` (12px) |

The fade uses the `fade` class from `<FadeTransition>`, so `--fade-transition-duration` sets its length. It runs only as the dialog opens and closes; an open dialog stays still while other dialogs open and close.

**Global tokens it reads** — move these to retheme broadly: `--tint-100`, `--width-narrow`, `--space-normal`, `--space-small`, `--color-backdrop`, and `--duration-fast` (through `<FadeTransition>`).

