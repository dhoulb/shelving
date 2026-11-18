# NavigationSequence.back()

- Kind: method
- Member of: `NavigationSequence`

Go back to a URL, as a back button does.
- The URL is an earlier page in `stack`: go back to it. When it is the entry just before the current one, this goes back in the browser history. Else it pushes the URL again at that page's ordinal.
- The URL is the root of `stack`: push it at ordinal 0.
- Else push the URL in place of the top page of `stack`.
- It works when the app was opened at the current page, so a back button always has somewhere to go.
- If the browser refuses to go back with the Navigation API, it uses `history.back()`.

## Signatures

```ts
back(possible: PossibleURL, stack: AbsolutePath | null = this._stack): void
```
