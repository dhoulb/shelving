# TransitionScrub.seek()

- Kind: method
- Member of: `TransitionScrub`

Move the transition to a point, from `0` (start) to `1` (end).
- Safe to call before the transition is ready: it moves there as soon as it is.

## Signatures

```ts
seek(progress: number): void
```
