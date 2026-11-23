# DialogsStore

- Kind: class
- Import: `import { DialogsStore } from "shelving/ui";`
- Extends: `ArrayStore<ReactElement>`

Store holding the live list of open `<Dialog>` elements.

- `show()` opens a new dialog. A dialog is removed from the list as soon as it closes.
- `<Dialogs>` renders the list inside a transition, so dialogs animate in and out with view transitions.
- A dialog closed by a link tap goes at once, with no transition (`getTransition()`), so the page change gets the view transition.

## Signatures

```ts
new DialogsStore()
```

## Returns

| Type | Description |
| --- | --- |
| `DialogsStore` |  |

## Methods

- [DialogsStore.show()](DialogsStore/show.md): Open a new dialog wrapping the given content.
