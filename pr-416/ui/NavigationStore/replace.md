# NavigationStore.replace()

- Kind: method
- Member of: `NavigationStore`

Replace the current URL, with no transition.
- The page stays in the same stack, at the same depth, so a cached page stays mounted.
- Use it for a page that knows its canonical URL, or for in-page tabs.
- Pass a `stack` to move the page into that stack: at its root if the URL is the root, else on top of its pages. For example, a login page calls `replace("/home", "/home")`.

## Signatures

```ts
replace(possible: PossibleURL, stack: AbsolutePath | null = this.stack.value): void
```
