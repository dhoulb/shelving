# URLStore.isProud()

- Kind: method
- Member of: `URLStore`

Is `target` proud relative to this store's URL?
- Proud means this store's URL is `target` or a descendant of `target` — i.e. `target` sits at or above the current URL in the hierarchy.
- Useful for marking a menu item as "current branch" when the user is somewhere deeper in its sub-tree.

## Signatures

```ts
isProud(target: PossibleURL): boolean
```
