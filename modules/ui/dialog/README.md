# Dialog

Overlay components for modals and imperative dialogs. Two approaches: mount a `<Dialog>` declaratively in the tree, or use `DialogsStore` to push dialogs imperatively from anywhere in the app.

## Components

| Export | Purpose |
|---|---|
| `<Dialog>` | A native `<dialog>` element opened in modal mode. Closes on backdrop click, on links/buttons inside a `<nav>`, or via `<DialogCloseButton>`. |
| `<DialogCloseButton>` | A button that closes its nearest wrapping `<dialog>`. Renders an X icon by default. |
| `<DialogsContext>` | Creates a `DialogsStore` and provides it to descendants. |
| `<Dialogs>` | Renders the list of dialogs currently in the nearest `DialogsStore`. Mount once near the root of the app. |
| `DialogsStore` | An `ArrayStore<ReactElement>` with `.show(children)` and `.hideAll()`. Call `requireDialogs()` to get it from any component. |
| `<Modal>` | A non-blocking `<aside>` overlay for persistent panels (drawers, toasts, side-sheets) — not a `<dialog>`. |

## Declarative usage

Mount `<Dialog>` directly when its lifetime matches a React state variable:

```tsx
import { Dialog, DialogCloseButton } from "shelving/ui";

function ConfirmDelete({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <Dialog onClose={onClose}>
      <p>Delete this item?</p>
      <button type="button" onClick={onConfirm}>Delete</button>
      <DialogCloseButton/>
    </Dialog>
  );
}

// In the parent:
{showConfirm && <ConfirmDelete onConfirm={handleDelete} onClose={() => setShowConfirm(false)}/>}
```

## Imperative usage with DialogsStore

Set up the context once near the app root, then call `.show()` from any component:

```tsx
import { DialogsContext, Dialogs, requireDialogs } from "shelving/ui";

// App root — add <Dialogs> alongside your content.
function AppRoot() {
  return (
    <DialogsContext>
      <AppContent/>
      <Dialogs/>
    </DialogsContext>
  );
}

// Anywhere in the tree:
function DeleteButton({ id }: { id: string }) {
  const dialogs = requireDialogs();
  const open = () => dialogs.show(
    <ConfirmDelete id={id} onConfirm={() => handleDelete(id)}/>
  );
  return <button type="button" onClick={open}>Delete</button>;
}
```

`<Dialogs>` removes a dialog from the DOM 500 ms after it closes, giving CSS animations time to finish.

## Modal

`<Modal>` is an `<aside>` element — use it for persistent overlays that coexist with the page rather than blocking interaction:

```tsx
<Modal>
  <NotificationPanel/>
</Modal>
```

## See also

- [`notice`](/ui/notice) — inline and global notices (toasts, banners)
- [`form`](/ui/form) — form components to put inside dialogs
- [`transition`](/ui/transition) — animate dialog enter / leave
