# NavigationStore.replace()

- Kind: method
- Member of: `NavigationStore`

Replace the current URL, with no transition.
- The page stays in the same stack, at the same depth, so a cached page stays mounted.
- Use it for a page that knows its canonical URL, or for in-page tabs.

## Signatures

```ts
replace(possible: PossibleURL): void
```
