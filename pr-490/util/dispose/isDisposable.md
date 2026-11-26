# isDisposable()

- Kind: function
- Import: `import { isDisposable } from "shelving/util/dispose";`

Is an unknown value a disposable object?

## Signatures

```ts
isDisposable(v: unknown): v is Disposable
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `v` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `v is Disposable` | `true` if `v` has a `[Symbol.dispose]` method, narrowing its type to `Disposable`. |
