# NavigationStore.replace()

- Kind: method
- Member of: `NavigationStore`

Replace the current URL, with no transition.
- The page stays in the same stack, at the same depth, so a cached page stays mounted.
- Use it for a page that knows its canonical URL, or for in-page tabs.
- Pass a `stack` to move the page into that stack: at its root if the URL is the root, else on top of its pages. For example, a login page calls `replace("/home", "/home")`.
- From an unstacked page, a URL that is a stack root goes to that stack, at its root, with no `stack` too.

## Signatures

```ts
replace(possible: PossibleURL, stack: AbsolutePath = this.stack.value): void
```
