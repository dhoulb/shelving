# NoticesProps

- Kind: interface
- Import: `import { NoticesProps } from "shelving/ui";`
- Extends: `FlexVariants`

Props for `<Notices>` — the corner for the list, and flex styling variants for the notices container.

## Signatures

```ts
{
	position?: NoticesPosition | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `position` | `NoticesPosition \| undefined` | Corner of the screen for the list. New notices slide in from this side. Defaults to `"bottom-right"`. |
