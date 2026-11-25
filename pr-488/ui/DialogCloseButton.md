# DialogCloseButton

- Kind: component
- Import: `import { DialogCloseButton } from "shelving/ui";`

Button that closes its wrapping `<dialog>`, showing an X icon by default.
- A `<Dialog>` has no close button of its own. Put this anywhere inside the dialog to add one.
- It is fixed to the top-right corner of the screen, clear of the safe areas.
- Styled with the shared `Button` classes.
- `plain` and `small` by default, so only a small icon shows until hover or focus. Pass `plain={false}` for a solid button, or `small={false}` for a normal size.

## Signatures

```ts
DialogCloseButton({
	children = <CloseIcon />,
	plain = true,
	small = true,
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
