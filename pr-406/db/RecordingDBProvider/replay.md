# RecordingDBProvider.replay()

- Kind: method
- Member of: `RecordingDBProvider`

Replay every recorded operation onto another provider, in order.
- Reads apply what they observed and writes re-issue, so this refreshes a mirror or cache exactly — see `replayOperations()`.
- Use `replayWrites()` for an authoritative target, where applying observed reads would overwrite newer data.

## Signatures

```ts
replay(provider: DBProvider<I, T>): Promise<void>
```
