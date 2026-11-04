# awaitNotified()

- Kind: function
- Import: `import { awaitNotified } from "shelving/ui";`

Await a pending value and dispatch a success or error notice to the window based on its resolution.

- A resolved truthy value becomes a `"success"` notice; a rejection becomes an `"error"` notice via `notifyThrown()`.

## Signatures

```ts
awaitNotified(pending: PromiseLike<ReactNode | undefined | void>): Promise<boolean>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `pending` | `PromiseLike<ReactNode \| undefined \| void>` | The promise-like value to await. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<boolean>` | `true` if the value resolved, `false` if it rejected. |
