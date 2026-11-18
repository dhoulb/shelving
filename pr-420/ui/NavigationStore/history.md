# NavigationStore.history()

- Kind: method
- Member of: `NavigationStore`

Get the pages in a stack, root first, or every page in every stack.
- Read from the browser history entries up to the current one.
- A listed stack whose root entry is not in the history (a deep link, or the browser keeps a limited history) still starts with its root.
- The floating stack (`null`) has no root, so it starts with its oldest page.
- Without the Navigation API this is always empty.

## Signatures

```ts
history(stack: AbsolutePath | null = this.stack.value): AbsolutePath[]
```
