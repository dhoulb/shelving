# PopoverButton

- Kind: component
- Import: `import { PopoverButton } from "shelving/ui";`

Popover variant of `<Button>` — a button that reveals floating popover content beside it when clicked.
- The button is the primary element: it takes all the `ButtonVariants` styling props, and `className` lands on it (not the popover panel).
- The first element passed to `children` is the button label; the rest become the popover contents.

DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.

## Signatures

```ts
PopoverButton({
	children: [buttonChildren, ...popoverChildren], //
	className,
	...props
}: PopoverButtonProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `PopoverButtonProps` |  |
| `.children` | `PopoverChildren` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `Button` that toggles its attached `Popover` open and closed. |

## Examples

```ts
<PopoverButton>{label}{panel}</PopoverButton>
```
