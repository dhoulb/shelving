# awaitAbort()

- Kind: function
- Import: `import { awaitAbort } from "shelving/util/async";`

Get a promise that rejects with the signal's reason when an `AbortSignal` fires.
- Rejects immediately if the signal is already aborted.
- Use with `awaitRace()` to cancel a concurrent operation when a signal fires.

## Signatures

```ts
awaitAbort(signal: AbortSignal): Promise<never>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `signal` | `AbortSignal` | The `AbortSignal` to watch. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<never>` | A promise that never resolves and rejects with the signal's reason when it fires. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | The signal's `reason` when the signal aborts. |
