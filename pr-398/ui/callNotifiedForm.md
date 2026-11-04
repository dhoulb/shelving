# callNotifiedForm()

- Kind: function
- Import: `import { callNotifiedForm } from "shelving/ui";`

Run a form submit callback and publish success/error notices based on its return or thrown value.
- Strings returned are shown as success notices; thrown values are routed through `notifyThrownForm()`.
- Async callbacks are awaited via `awaitNotifiedForm()`.

## Signatures

```ts
callNotifiedForm(value: T, store: FormStore<T>, form: HTMLFormElement, callback?: NoticeCallback<[T, ...A]>, ...args: A): boolean | Promise<boolean>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `T` | The validated form data passed to the callback. |
| `store` | `FormStore<T>` | The `FormStore` the form is bound to. |
| `form` | `HTMLFormElement` | The underlying `HTMLFormElement` notices are anchored to. |
| `callback` | `NoticeCallback<[T, ...A]>` | Optional callback to run with the value and extra args. Optional. |
| `args` | `A` | Additional arguments forwarded to the callback. |

## Returns

| Type | Description |
| --- | --- |
| `boolean \| Promise<boolean>` | `true` on success, `false` on failure (or a `Promise` resolving to one). |

## Examples

```ts
callNotifiedForm(data, store, formEl, onSubmit, event)
```
