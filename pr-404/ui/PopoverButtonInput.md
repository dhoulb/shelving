# PopoverButtonInput

- Kind: component
- Import: `import { PopoverButtonInput } from "shelving/ui";`

Popover variant of `<ButtonInput>` — an input-styled button that reveals floating popover content beside it when clicked.
- The button is the primary element: it takes the shared `InputProps`, and `className` lands on it (not the popover panel).
- The first element passed to `children` is the button label; the rest become the popover contents.

DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.

## Signatures

```ts
PopoverButtonInput({
	children: [buttonChildren, ...popoverChildren], //
	className,
	...props
}: PopoverButtonInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `PopoverButtonInputProps` |  |
| `.children` | `PopoverChildren` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `ButtonInput` that toggles its attached `Popover` open and closed. |

## Examples

```ts
<PopoverButtonInput name="filter">{label}{panel}</PopoverButtonInput>
```
