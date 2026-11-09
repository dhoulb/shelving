# WidthVariants

- Kind: interface
- Import: `import { WidthVariants } from "shelving/ui";`

Variant props that set (or unconstrain) a component's width, e.g. `width="narrow"` or `width="12x"`.

## Signatures

```ts
{
	width?: WidthVariant | undefined;
	grow?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `width` | `WidthVariant \| undefined` | Width of the element. Optional. |
| `grow` | `boolean \| undefined` | Let the element grow past its `width` instead of staying exact. Optional. |
