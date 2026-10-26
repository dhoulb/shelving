# awaitNotifiedForm()

- Kind: function
- Import: `import { awaitNotifiedForm } from "shelving/ui";`

Await a pending submit result and publish a success or error notice to a form once it settles.

## Signatures

```ts
awaitNotifiedForm(store: FormStore<T>, form: HTMLFormElement, pending: PromiseLike<ReactNode | undefined | void>): Promise<boolean>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `store` | `FormStore<T>` | The `FormStore` the form is bound to. |
| `form` | `HTMLFormElement` | The underlying `HTMLFormElement` notices are anchored to. |
| `pending` | `PromiseLike<ReactNode \| undefined \| void>` | The pending result to await. |

## Returns

| Type | Description |
| --- | --- |
| `Promise<boolean>` | A `Promise` resolving to `true` on success or `false` on failure. |

## Examples

```ts
await awaitNotifiedForm(store, formEl, pending)
```
