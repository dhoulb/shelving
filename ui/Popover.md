# Popover

- Kind: component
- Import: `import { Popover } from "shelving/ui";`

Trigger element that reveals a floating popover panel beside it when active or focused.
- The first `children` node is the trigger; the rest become the popover contents.
- While open, calls `onClose` when focus leaves the popover or on `Escape`. Focus is never held, so Tab can always move past it.
- `className` lands on the floating panel rather than the wrapper, since the panel is the surface worth styling.

@todo DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.

A trigger with a panel that floats below it. Use it for a short menu or list that opens from a button or an input.

**Things to know:**

- The first child is the trigger, such as a `<Button>` or an input. The other children go in the panel.
- By default the panel is open when any panel child is truthy. Set `open` to control it yourself.
- While the panel is open, `onClose()` is called when focus leaves the popover (a tap outside, or Tab past the last control) or the user presses Escape. The popover never holds focus.
- The panel is as wide as the popover, and below the trigger. It scrolls when its content is taller than `--popover-height`.
- `className` goes on the panel, not on the wrapper.
- `<PopoverButton>` and `<PopoverButtonInput>` add the open and close state for you.

## Usage

```tsx live
import { useState } from "react";
import { Button, Paragraph, Popover } from "shelving/ui";

function Help() {
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onClose={() => setOpen(false)}>
			<Button onClick={() => setOpen(!open)}>Help</Button>
			<Paragraph>Press Escape to close this panel.</Paragraph>
		</Popover>
	);
}

<Help />;
```

## Styling

Override these hooks at `:root`. The tint hooks (`--popover-border`, `--popover-background`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable               | Styles                                            | Default                      |
| ---------------------- | ------------------------------------------------- | ---------------------------- |
| `--popover-background` | Panel background                                  | `var(--tint-100)`            |
| `--popover-border`     | Panel border colour (width is `--popover-stroke`) | `var(--tint-80)`             |
| `--popover-stroke`     | Panel border width (one length)                   | `var(--stroke-normal)` (1px) |
| `--popover-radius`     | Panel corner radius                               | `var(--radius-xsmall)` (8px) |
| `--popover-padding`    | Panel top and bottom padding (one length)         | `var(--space-small)` (12px)  |
| `--popover-indent`     | Panel left and right padding (one length)         | `var(--space-small)` (12px)  |
| `--popover-shadow`     | Panel drop shadow                                 | `var(--shadow-small)`        |
| `--popover-offset-y`   | Space between the trigger and the panel           | `var(--space-xsmall)` (8px)  |
| `--popover-height`     | Maximum panel height, then it scrolls             | `30vh`                       |

**Global tokens it reads:** `--tint-80`, `--tint-100`, `--stroke-normal`, `--radius-xsmall`, `--space-small`, `--space-xsmall`, `--shadow-small`.


## Signatures

```ts
Popover({
	children: [trigger, ...popover], //
	onClose,
	open = popover.flat().some(isTruthy),
	className,
}: PopoverProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `PopoverProps` |  |
| `.children` | `PopoverChildren` | Children for the popover. |
| `.onClose` | `Callback` | Callback that gets called when the Popover closes. Optional. |
| `.open` | `boolean` | Whether the popover is open/closed (defaults to whether all `popoverChildren` nodes has at least one truthy node). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A wrapper element containing the trigger and (when open) the popover panel. |
