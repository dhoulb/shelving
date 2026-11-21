# PopoverProps

- Kind: interface
- Import: `import { PopoverProps } from "shelving/ui";`
- Extends: `ClassProps`

Props for `Popover`, a trigger element that reveals floating content.

## Signatures

```ts
{
	children: PopoverChildren;
	onClose?: Callback;
	open?: boolean;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `children` | `PopoverChildren` | Children for the popover. |
| `onClose` | `Callback` | Callback that gets called when the Popover closes. Optional. |
| `open` | `boolean` | Whether the popover is open/closed (defaults to whether all `popoverChildren` nodes has at least one truthy node). Optional. |
