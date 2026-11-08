# Popover()

- Kind: function
- Import: `import { Popover } from "shelving/ui";`

Trigger element that reveals a floating popover panel beside it when active or focused.
- The first `children` node is the trigger; the rest become the popover contents.
- Closes on blur away or `Escape`, calling `onClose`.
- `className` lands on the floating panel rather than the wrapper, since the panel is the surface worth styling.

@todo DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.

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

## Examples

```ts
<Popover>{trigger}{panelContent}</Popover>
```
