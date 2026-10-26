# DialogsStore

- Kind: class
- Import: `import { DialogsStore } from "shelving/ui";`
- Extends: `ArrayStore<ReactElement>`

Store holding the live list of open `<Dialog>` elements.

- `show()` opens a new dialog. A dialog is removed from the list as soon as it closes.
- `<Dialogs>` renders the list inside a transition, so dialogs animate in and out with view transitions.

## Signatures

```ts
new DialogsStore()
```

## Returns

| Type | Description |
| --- | --- |
| `DialogsStore` |  |

## Methods

- [show](DialogsStore/show.md): Open a new dialog wrapping the given content.
