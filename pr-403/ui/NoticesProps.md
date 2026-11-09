# NoticesProps

- Kind: interface
- Import: `import { NoticesProps } from "shelving/ui";`
- Extends: `FlexVariants`

Props for `<Notices>` — the place for the list, and flex styling variants for the notices container.

## Signatures

```ts
{
	position?: NoticesPosition | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `position` | `NoticesPosition \| undefined` | Place on the screen for the list. New notices slide in from this side, or from the top or bottom edge for a centred list. Defaults to `"bottom-right"`. |
