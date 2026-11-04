# SubmitButton()

- Kind: function
- Import: `import { SubmitButton } from "shelving/ui";`

Submit button for a form that disables itself and shows a spinner while the form is busy.
- Defaults to full-width, solid primary styling and a "Save" label.

## Signatures

```ts
SubmitButton({
	children = _SUBMIT_CHILDREN,
	color = "primary",
	solid = true,
	full = true,
	className,
	...props
}: SubmitButtonProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `SubmitButtonProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<button type="submit">` element bound to the current form. |

## Examples

```ts
<SubmitButton>Save changes</SubmitButton>
```
