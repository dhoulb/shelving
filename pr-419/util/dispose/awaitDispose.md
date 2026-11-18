# awaitDispose()

- Kind: function
- Import: `import { awaitDispose } from "shelving/util/dispose";`

Safely dispose one or more `AsyncDisposable` or `Disposable` values in parallel — all are disposed even if some throw, errors are rethrown at the end.

@todo Potentially rewrite this to use `AsyncDisposableStack` internally.

## Signatures

```ts
awaitDispose(...values: Nullish<AsyncDisposable | Disposable | Callback | Promise<unknown>>[]): Promise<void>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `values` | `Nullish<AsyncDisposable \| Disposable \| Callback \| Promise<unknown>>[]` | Zero or more (possibly async) disposables, promises, or callbacks. - Note that spec says `[Symbol.dispose]` is called on an object if `[Symbol.asyncDispose]` is not found. - `Promises` and `Callback` are allowed because in real usage `[Symbol.asyncDispose]` may have other things to clean up too and it's neater to throw a single aggregate error. - `Nullish` values are skipped (for convenience). |

## Returns

| Type | Description |
| --- | --- |
| `Promise<void>` |  |

## Throws

| Type | Description |
| --- | --- |
| `Errors` | Error that aggregates all the disposal errors. |

## Examples

```ts
await awaitDispose(asyncResource, promise, () => cleanup()) // disposes all in parallel
```
