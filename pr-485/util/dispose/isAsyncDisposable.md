# isAsyncDisposable()

- Kind: function
- Import: `import { isAsyncDisposable } from "shelving/util/dispose";`

Is an unknown value an async disposable object?

## Signatures

```ts
isAsyncDisposable(v: unknown): v is AsyncDisposable
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `v` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `v is AsyncDisposable` | `true` if `v` has a `[Symbol.asyncDispose]` method, narrowing its type to `AsyncDisposable`. |
