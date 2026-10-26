# FormFooter

- Kind: component
- Import: `import { FormFooter } from "shelving/ui";`

Show a form footer with a submit button and the form's error message.
- Renders a row containing a `SubmitButton` (and any extra buttons passed as `children`).
- Renders a `<FormMessage>` beneath the buttons showing any error set on the form.

## Signatures

```ts
FormFooter({ children, submit, className }: FormFooterProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `FormFooterProps` |  |
| `.submit` | `ReactNode \| undefined` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A footer element with the submit row and form message. |

## Examples

```ts
<FormFooter submit="Save" />
```
