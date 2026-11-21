# awaitNotifiedElement()

- Kind: function
- Import: `import { awaitNotifiedElement } from "shelving/ui";`

Await a pending value and dispatch a success or error notice to a specific element based on its resolution.

- A resolved truthy value becomes a `"success"` notice; a rejection becomes an `"error"` notice via `notifyThrown()`.

## Signatures

```ts
awaitNotifiedElement(el: EventTarget | undefined, pending: PromiseLike<ReactNode | undefined | void>): Promise<boolean>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `el` | `EventTarget \| undefined` | Element to dispatch the notice event on (defaults to `window` when `undefined`). |
| `pending` | `PromiseLike<ReactNode \| undefined \| void>` | The promise-like value to await. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<boolean>` | `true` if the value resolved, `false` if it rejected. |

## Examples

```ts
await awaitNotifiedElement(formEl, save());
```
