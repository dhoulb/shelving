# NavigationStore.forward()

- Kind: method
- Member of: `NavigationStore`

Go forward to a URL, as a link does.
- The URL is the top page of `stack`: switch to that stack, at the same depth. This is a tab switch.
- Else push the URL onto `stack`, one level deeper than its top page.
- The URL you are already on: replace it instead.
- A change of stack slides by tab order. Else it slides forward.
- From an unstacked page (the `"/"` stack, when it is not one of the `stacks`), a URL that is a stack root goes to that stack. For example, a login page goes to `/home`.

## Signatures

```ts
forward(possible: PossibleURL, stack: AbsolutePath = this.stack.value): void
```
