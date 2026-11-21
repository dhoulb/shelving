# callSequence()

- Kind: function
- Import: `import { callSequence } from "shelving/util/sequence";`

Dispatch items in a sequence to a (possibly async) callback.
- Calls `callback` with each item as it arrives, then re-yields the item unchanged.

## Signatures

```ts
callSequence(sequence: AsyncIterable<T, void, void>, callback: ValueCallback<T>): AsyncGenerator<T, void, void>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `sequence` | `AsyncIterable<T, void, void>` | The source sequence to relay. |
| `callback` | `ValueCallback<T>` | Callback invoked with each yielded item. |

## Returns

| Type | Description |
| --- | --- |
| `AsyncGenerator<T, void, void>` | An async generator that yields the same items as `sequence`. |
