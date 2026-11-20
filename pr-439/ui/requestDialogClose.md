# requestDialogClose()

- Kind: function
- Import: `import { requestDialogClose } from "shelving/ui";`

Ask a `<dialog>` element to close, the same way as the Escape key.
- Fires a cancelable `cancel` event, so a `<Dialog>` keeps itself open and calls its `onClose`. Its parent then unmounts it, and it can animate out.
- Closes the dialog at once only if nothing cancels the event.
- Use it instead of `dialog.close()`, which closes at once and fires no `cancel` event, so the dialog vanishes with no transition.
- Not `requestClose()`: some browsers lack it, and Safari fires its `cancel` event as not cancelable. Both close the dialog at once.

## Signatures

```ts
requestDialogClose(dialog: HTMLDialogElement): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `dialog` | `HTMLDialogElement` | The `<dialog>` element to close. |

## Examples

```ts
requestDialogClose(dialog) // Like pressing Escape.
```
