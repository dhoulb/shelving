# isSequence()

- Kind: function
- Import: `import { isSequence } from "shelving/util/sequence";`

Is a value an async iterable object?
- Any object with a `Symbol.asyncIterator` property is an async iterable.

## Signatures

```ts
isSequence(value: unknown): value is AsyncIterable<unknown>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is AsyncIterable<unknown>` | `true` if `value` is an `AsyncIterable`, narrowing its type. |
