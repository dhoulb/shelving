# NavigationSequence.listen()

- Kind: method
- Member of: `NavigationSequence`

Start listening to the browser (back, forward and swipe).
- Saves the current stack and ordinal on the current history entry, if it has none.
- `<Navigation>` calls it once, when it mounts.

## Signatures

```ts
listen(): () => void
```
