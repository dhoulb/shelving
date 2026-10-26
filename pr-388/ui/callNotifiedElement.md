# callNotifiedElement()

- Kind: function
- Import: `import { callNotifiedElement } from "shelving/ui";`

Run a callback and dispatch a success or error notice to a specific element based on its return or throw.

- A returned truthy value becomes a `"success"` notice; a thrown value becomes an `"error"` notice via `notifyThrown()`.
- Resolves asynchronously when the callback returns a promise.

## Signatures

```ts
callNotifiedElement(el: EventTarget | undefined, callback: NoticeCallback<A>, ...args: A): boolean | Promise<boolean>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `el` | `EventTarget \| undefined` | Element to dispatch the notice event on (defaults to `window` when `undefined`). |
| `callback` | `NoticeCallback<A>` | The callback to run, whose return/throw drives the notice. |
| `args` | `A` | Arguments forwarded to the callback. |

## Returns

| Type | Description |
| --- | --- |
| `boolean \| Promise<boolean>` | `true` if the callback succeeded, `false` if it threw (a `Promise` of the same when async). |

## Examples

```ts
callNotifiedElement(formEl, () => save());
```
