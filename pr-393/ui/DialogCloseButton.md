# DialogCloseButton

- Kind: component
- Import: `import { DialogCloseButton } from "shelving/ui";`

Button that closes its wrapping `<dialog>`, showing an X icon by default.
- Styled with the shared `Button` classes (positioning comes from the `<Dialog>`'s own `.close` wrapper rules).
- `plain` by default so only the icon shows until hover or focus — pass `plain={false}` for a solid button.

## Signatures

```ts
DialogCloseButton({
	children = <XMarkIcon />,
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
