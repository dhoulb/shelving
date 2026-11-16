# callNotified()

- Kind: function
- Import: `import { callNotified } from "shelving/ui";`

Run a callback and dispatch a success or error notice to the window based on its return or throw.

- A returned truthy value becomes a `"success"` notice; a thrown value becomes an `"error"` notice via `notifyThrown()`.
- Resolves asynchronously when the callback returns a promise.

## Signatures

```ts
callNotified(callback: NoticeCallback<A>, ...args: A): boolean | Promise<boolean>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `callback` | `NoticeCallback<A>` | The callback to run, whose return/throw drives the notice. |
| `args` | `A` | Arguments forwarded to the callback. |

## Returns

| Type | Description |
| --- | --- |
| `boolean \| Promise<boolean>` | `true` if the callback succeeded, `false` if it threw (a `Promise` of the same when async). |
