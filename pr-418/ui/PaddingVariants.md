# PaddingVariants

- Kind: interface
- Import: `import { PaddingVariants } from "shelving/ui";`

Variant props for the block-padding (top + bottom) of a component, e.g. `padding="large"`.

## Signatures

```ts
{
	padding?: Exclude<SpaceValue, "auto"> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `padding` | `Exclude<SpaceValue, "auto"> \| undefined` | Block-padding (top + bottom) of the element. Optional. |
