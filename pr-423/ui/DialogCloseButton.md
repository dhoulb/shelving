# DialogCloseButton

- Kind: component
- Import: `import { DialogCloseButton } from "shelving/ui";`

Button that closes its wrapping `<dialog>`, showing an X icon by default.
- A `<Dialog>` has no close button of its own. Put this anywhere inside the dialog to add one.
- It is fixed to the top-right corner of the screen, clear of the safe areas.
- Styled with the shared `Button` classes.
- `plain` by default so only the icon shows until hover or focus — pass `plain={false}` for a solid button.

## Signatures

```ts
DialogCloseButton({
	children = <CloseIcon />,
	plain = true,
	className,
	...variants
}: DialogCloseButtonProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `DialogCloseButtonProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
