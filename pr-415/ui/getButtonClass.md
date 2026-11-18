# getButtonClass()

- Kind: function
- Import: `import { getButtonClass } from "shelving/ui";`

Get the full combined `className` string for a button from its styling variants.

## Signatures

```ts
getButtonClass(variants: ButtonVariants): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `ButtonVariants` | The button styling variants (block, flex, status, plus button toggles). |
| `.solid` | `boolean \| undefined` | Solid styling: a strong fill of the tint colour with white text. Use it for the main action. Optional. |
| `.plain` | `boolean \| undefined` | Plain styling: no fill or border until hover or focus. Optional. |
| `.outline` | `boolean \| undefined` | Outline styling: like `plain`, but with a border until hover or focus. Optional. |
| `.selected` | `boolean \| undefined` | Whether the button is the selected one in a group, such as a set of tabs. - `true` sets `aria-pressed` (or `aria-current` on a link) and keeps the button's normal look. - `false` also drops the fill until hover or focus, so the selected button stands out. - `undefined` (the default) means the button is not part of a group. Optional. |
| `.small` | `boolean \| undefined` | Make the button appear smaller. Optional. |
| `.full` | `boolean \| undefined` | Fill the available width instead of sizing to content (buttons are content-width by default). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A space-separated `className` string combining all the resolved variant classes. |
