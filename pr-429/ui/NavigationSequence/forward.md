# NavigationSequence.forward()

- Kind: method
- Member of: `NavigationSequence`

Go forward to a URL, as a link does.
- The URL is the top page of `stack`: switch to that stack, at the same ordinal. This is a tab switch.
- Else push the URL onto `stack`, one level deeper than its top page.
- The URL you are already on: replace it instead.
- A change of stack slides by tab order. Else it slides forward.

## Signatures

```ts
forward(possible: PossibleURL, stack: AbsolutePath | null = this._stack): void
```
