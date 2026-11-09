# runSequence()

- Kind: function
- Import: `import { runSequence } from "shelving/util/sequence";`

Iterate over a sequence until the returned `stop()` callback is called.

Regarding errors:
- Does not stop iterating on errors, simply sends the error to `onError()` and continues to iterate.
- On the following iterator after throwing an error, a "generator" will return `done: true` (because they regard errors as concluding the iteration).
- But the iterator protocol does not require this, so this continues to iterate until it's explicitly ended via the returned `stop()` callback.

## Signatures

```ts
runSequence(sequence: AsyncIterable<T, R | undefined, N | undefined>, onNext?: (value: T) => N | undefined, onError?: ErrorCallback, onReturn?: (value: R | undefined) => void): (value?: R | undefined) => void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `sequence` | `AsyncIterable<T, R \| undefined, N \| undefined>` | The source sequence to iterate over. |
| `onNext` | `(value: T) => N \| undefined` | Called with each yielded value; its return value is fed back into the iterator as the next `next()` argument. Optional. |
| `onError` | `ErrorCallback` | Called with any error thrown during iteration (iteration continues regardless). Optional. |
| `onReturn` | `(value: R \| undefined) => void` | Called with the final return value when the sequence ends or is stopped. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `(value?: R \| undefined) => void` | Callback function that can end the sequence run, optionally with a return value. |

## Throws

| Type | Description |
| --- | --- |
| `UnexpectedError` | If the source iterator's `return()` does not return a `done` result. |
