# getStatusClass()

- Kind: function
- Import: `import { getStatusClass } from "shelving/ui";`

Get the status tint class for a component from its `status` variant prop.

- Sets the key `.tint-50` colour for an element (e.g. `--color-success`) based on e.g. `status="success"`.
- The full set of shades e.g. `--tint-20` and `--tint-95` are created for the selected colour, ready for the element to compose.

## Signatures

```ts
getStatusClass({ status }: StatusVariants): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `StatusVariants` |  |
| `.status` | `Status \| undefined` | Status for the element. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The combined tint + status class string, or `undefined` when no `status` is set. |

## Examples

```ts
getStatusClass({ status: "success" }) // "tint success"
```
