# TransitionScrub.cancel()

- Kind: method
- Member of: `TransitionScrub`

Play the transition back to the start, run `undo()`, and then end the transition.
- `undo()` must put back the state from before the update, so the page matches the start of the transition when it ends.
- If `undo()` returns a promise (for example one that resolves after React commits), it waits for it before it ends the transition.

## Signatures

```ts
cancel(undo: () => PromiseLike<void> | void): Promise<void>
```
