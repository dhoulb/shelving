# PopoverButton

A `<Button>` that opens a `<Popover>` panel below it. A tap on the button opens or closes the panel.

**Things to know:**

- The first child is the button content. The other children go in the panel.
- It takes all the `<Button>` style props, such as `solid` or `color`. `className` goes on the button.
- A tap outside the popover, or the Escape key, closes the panel.
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
