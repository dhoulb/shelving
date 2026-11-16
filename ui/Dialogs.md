# Dialogs

- Kind: component
- Import: `import { Dialogs } from "shelving/ui";`

Render the open dialogs from the current `DialogsContext`.

- It renders the list inside a transition, so each dialog animates in and out.
- To open a dialog, use `requireDialogs()` and `DialogsStore.show()`. Pass the `DialogsStore` into any function that opens one.
- A `<Dialog>` you render from `useStore()` never animates, even if you write the store inside `startTransition()`.

## Signatures

```ts
Dialogs(): ReactNode
```

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |
