# NavigationSequence.replace()

- Kind: method
- Member of: `NavigationSequence`

Replace the current URL, with no transition.
- The page stays in the same stack, at the same ordinal, so a cached page stays mounted.
- Use it for a page that knows its canonical URL, or for in-page tabs.
- Pass a `stack` to move the page into that stack: at its root if the URL is the root, else on top of its pages. For example, a login page calls `replace("/home", "/home")`.

## Signatures

```ts
replace(possible: PossibleURL, stack: AbsolutePath | null = this._stack): void
```
