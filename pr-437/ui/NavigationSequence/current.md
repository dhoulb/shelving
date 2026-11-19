# NavigationSequence.current()

- Kind: method
- Member of: `NavigationSequence`

Where the browser history is now, as an event with no direction.
- `<Navigation>` reads it for its first render, and again when it starts listening, to catch up on changes it missed.

## Signatures

```ts
current(): NavigationEvent
```
