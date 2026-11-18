# FormField

- Kind: component
- Import: `import { FormField } from "shelving/ui";`

Show a `<Field>` (label, input, and message) for a single named property of the current form.

## Signatures

```ts
FormField({ name, className, ...props }: InputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `InputProps` |  |
| `.name` | `string` | The `name=""` prop of the input. |
| `.title` | `string \| undefined` | Friendly title for the input. Optional. |
| `.placeholder` | `string \| undefined` | Placeholder for the input. Defaults to `title`. Set to `""` to show no placeholder. Optional. |
| `.required` | `boolean \| undefined` | Whether the input is required. Optional. |
| `.disabled` | `boolean \| undefined` | Whether the input is disabled. Optional. |
| `.message` | `string \| undefined` | Any error message for the input. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<Field>` wrapping a `SchemaInput` bound to the named field. |

## Examples

```ts
<FormField name="email" />
```
