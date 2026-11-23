# repeatUntil()

- Kind: function
- Import: `import { repeatUntil } from "shelving/util/sequence";`

Infinite sequence that relays a source sequence until one of the abort signals resolves.
- Races each step of `source` against the supplied signal promises; when a signal wins, tells the source iterator to clean up and returns the signal's value.

## Signatures

```ts
repeatUntil(source: AsyncIterable<T, R | undefined, N | undefined>, ...signals: [PromiseLike<R>, ...PromiseLike<R>[]]): AsyncGenerator<T, R | undefined, N | undefined>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `AsyncIterable<T, R \| undefined, N \| undefined>` | The source sequence to relay values from. |
| `signals` | `[PromiseLike<R>, ...PromiseLike<R>[]]` | One or more promises that, when resolved, abort the relay and end the sequence. |

## Returns

| Type | Description |
| --- | --- |
| `AsyncGenerator<T, R \| undefined, N \| undefined>` | The value the winning abort signal resolved with, or the source's own return value if it finishes first. |

## Throws

| Type | Description |
| --- | --- |
| `UnexpectedError` | If the source iterator's `return()` does not return a `done` result. |
