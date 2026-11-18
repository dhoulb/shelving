# ButtonVariants

- Kind: interface
- Import: `import { ButtonVariants } from "shelving/ui";`
- Extends: `BlockVariants`

Styling variants for a `Button`: the block variants (space, padding, indent, width, typography), flex, and status, plus button-specific toggles.

## Signatures

```ts
{
	solid?: boolean | undefined;
	plain?: boolean | undefined;
	outline?: boolean | undefined;
	selected?: boolean | undefined;
	small?: boolean | undefined;
	full?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `solid` | `boolean \| undefined` | Solid styling: a strong fill of the tint colour with white text. Use it for the main action. Optional. |
| `plain` | `boolean \| undefined` | Plain styling: no fill or border until hover or focus. Optional. |
| `outline` | `boolean \| undefined` | Outline styling: like `plain`, but with a border until hover or focus. Optional. |
| `selected` | `boolean \| undefined` | Whether the button is the selected one in a group, such as a set of tabs. - `true` sets `aria-pressed` (or `aria-current` on a link) and keeps the button's normal look. - `false` also drops the fill until hover or focus, so the selected button stands out. - `undefined` (the default) means the button is not part of a group. Optional. |
| `small` | `boolean \| undefined` | Make the button appear smaller. Optional. |
| `full` | `boolean \| undefined` | Fill the available width instead of sizing to content (buttons are content-width by default). Optional. |
