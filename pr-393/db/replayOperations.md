# replayOperations()

- Kind: function
- Import: `import { replayOperations } from "shelving/db";`

Replay a list of database operations onto a provider, re-issuing each one in order.

- Writes re-issue as the corresponding item write — `"add"` replays as `DBProvider.setItem()` with the logged id, so the target keeps the same generated ids.
- `"get"` reads apply what they observed — the item is set, or deleted when the read confirmed it absent. That's right for refreshing a mirror or cache, and wrong for an authoritative target, where an observed snapshot would overwrite newer data — replay only the writes there (see `RecordingDBProvider.replayWrites()`).
- Operations re-issue as a sequence of awaited writes — the replay itself is not atomic.

## Signatures

```ts
replayOperations(provider: DBProvider<I, T>, operations: DBOperations<I, T>): Promise<void>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `provider` | `DBProvider<I, T>` | Provider to replay the operations onto. |
| `operations` | `DBOperations<I, T>` | Operations to replay, in order. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<void>` |  |

## Examples

```ts
await replayOperations(mirror, recording.operations);
```
