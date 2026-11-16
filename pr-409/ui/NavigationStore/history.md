# NavigationStore.history()

- Kind: method
- Member of: `NavigationStore`

Get the pages in a stack, root first, or every page in every stack.
- Read from the browser history entries up to the current one.
- A stack whose root entry is gone (the browser keeps a limited history) still starts with its root.
- Without the Navigation API this is always empty.

## Signatures

```ts
history(stack: AbsolutePath = this.stack.value): AbsolutePath[]
```
