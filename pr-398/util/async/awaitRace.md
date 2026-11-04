# awaitRace()

- Kind: function
- Import: `import { awaitRace } from "shelving/util/async";`

Race promises like `Promise.race()` but silently swallow rejections from the losers.
- Returns a promise that settles with the first input to settle, exactly like `Promise.race()`.
- The losing inputs keep running (Promises cannot be cancelled), but their eventual rejection — if any — is silently absorbed instead of bubbling up as an unhandled rejection.
- Built for cancellation/timeout patterns, where the loser's eventual fate is genuinely uninteresting once another arm has settled. Do not use when both arms might surface meaningful errors that the caller should see.

## Signatures

```ts
awaitRace(...promises: Promise<T>[]): Promise<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `promises` | `Promise<T>[]` | The promises to race against each other. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<T>` | A promise that settles with the first input to settle. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | The rejection reason of the first input to settle, if it rejects. |
