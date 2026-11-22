# PopoverButton

- Kind: component
- Import: `import { PopoverButton } from "shelving/ui";`

Popover variant of `<Button>` — a button that reveals floating popover content beside it when clicked.
- The button is the primary element: it takes all the `ButtonVariants` styling props, and `className` lands on it (not the popover panel).
- The first element passed to `children` is the button label; the rest become the popover contents.

DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.

A `<Button>` that opens a `<Popover>` panel below it. A tap on the button opens or closes the panel.

**Things to know:**

- The first child is the button content. The other children go in the panel.
- It takes all the `<Button>` style props, such as `solid` or `color`. `className` goes on the button.
- A tap outside the popover, Tab past it, or the Escape key closes the panel.
- For a trigger that looks like an input, use `<PopoverButtonInput>`.

## Usage

```tsx live
import { Paragraph, PopoverButton } from "shelving/ui";

<PopoverButton solid>
	Details
	<Paragraph>Order 1042 ships on Monday.</Paragraph>
</PopoverButton>;
```

## Styling

`PopoverButton` has no own hooks. The button uses the `<Button>` styles and the panel uses the `<Popover>` styles.


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
