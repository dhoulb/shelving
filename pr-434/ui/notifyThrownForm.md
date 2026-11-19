# notifyThrownForm()

- Kind: function
- Import: `import { notifyThrownForm } from "shelving/ui";`

Notify the user about a value thrown during submit, storing string errors as form field messages.
- Assigning a string `reason` to the store splits it into per-field messages instead of a global notice.

## Signatures

```ts
notifyThrownForm(store: FormStore<T>, form: HTMLFormElement, thrown: unknown): false
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `store` | `FormStore<T>` | The `FormStore` the thrown value is recorded on. |
| `form` | `HTMLFormElement` | The underlying `HTMLFormElement` notices are anchored to. |
| `thrown` | `unknown` | The value thrown during submit. |

## Returns

| Type | Description |
| --- | --- |
| `false` | Always `false`, signalling the submit failed. |

## Examples

```ts
notifyThrownForm(store, formEl, thrown)
```
