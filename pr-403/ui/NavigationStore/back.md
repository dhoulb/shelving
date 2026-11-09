# NavigationStore.back()

- Kind: method
- Member of: `NavigationStore`

Navigate back to a URL, pushing a new browser history entry with the `"back"` transition type.
- Use it for a "back to" link, so the page slides back, not forward.
- It does not go back in the browser history, so it also works when the page was opened directly.

## Signatures

```ts
back(possible: PossibleURL): void
```
