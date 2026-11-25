# RecordingDBProvider.replayReads()

- Kind: method
- Member of: `RecordingDBProvider`

Replay only the recorded `"get"` read operations onto another provider, in order.
- Applies what each read observed (setting the item, or deleting it when the read confirmed absence) — e.g. warming a cache from a recorded session.

## Signatures

```ts
replayReads(provider: DBProvider<I, T>): Promise<void>
```
