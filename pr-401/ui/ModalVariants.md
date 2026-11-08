# ModalVariants

- Kind: interface
- Import: `import { ModalVariants } from "shelving/ui";`

Variant props for `<Modal>` — pin the panel to one edge of the screen.

- Set one of `top`, `right`, `bottom`, or `left`. Without one, the panel is centred.
- If more than one is set, the first in the order `top`, `right`, `bottom`, `left` wins.

## Signatures

```ts
{
	top?: boolean | undefined;
	right?: boolean | undefined;
	bottom?: boolean | undefined;
	left?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `top` | `boolean \| undefined` | Pin the panel to the top edge, full width, and slide it in from the top. Optional. |
| `right` | `boolean \| undefined` | Pin the panel to the right edge, full height, and slide it in from the right. Optional. |
| `bottom` | `boolean \| undefined` | Pin the panel to the bottom edge, full width, and slide it in from the bottom. Optional. |
| `left` | `boolean \| undefined` | Pin the panel to the left edge, full height, and slide it in from the left. Optional. |
