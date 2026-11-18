# requireForm()

- Kind: function
- Import: `import { requireForm } from "shelving/ui";`

Hook that returns the current form's `FormStore` from context.

## Signatures

```ts
requireForm(caller?: AnyCaller): FormStore<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `caller` | `AnyCaller` | Function to attribute the error to if no form context is found. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `FormStore<T>` | The current `FormStore` instance. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if called outside a `Form` component. |

## Examples

```ts
const form = requireForm();
```
