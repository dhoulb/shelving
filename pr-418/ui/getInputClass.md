# getInputClass()

- Kind: function
- Import: `import { getInputClass } from "shelving/ui";`

Build the shared base `className` for a form input from its styling variants — the base input class plus any `InputVariants`.

## Signatures

```ts
getInputClass(props: InputVariants): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `InputVariants` |  |

## Returns

| Type | Description |
| --- | --- |
| `string` | The merged base input `className` string. |

## Examples

```ts
getClass(getInputClass(props), getModuleClass(INPUT_CSS, "text")) // a text input that also honours width variants
```
