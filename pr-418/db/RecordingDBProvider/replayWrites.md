# RecordingDBProvider.replayWrites()

- Kind: method
- Member of: `RecordingDBProvider`

Replay only the recorded write operations onto another provider, in order.
- The right call for authoritative targets — applying a log to a real database, audit replay, syncing a second source of truth — where updates should compose onto current state and observed reads must never overwrite newer data.

## Signatures

```ts
replayWrites(provider: DBProvider<I, T>): Promise<void>
```
