# HeightVariants

- Kind: interface
- Import: `import { HeightVariants } from "shelving/ui";`

Variant props that set a component's height, and where its content sits inside that height, e.g. `height="full" middle`.

## Signatures

```ts
{
	height?: HeightVariant | undefined;
	top?: boolean | undefined;
	middle?: boolean | undefined;
	bottom?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `height` | `HeightVariant \| undefined` | Height of the element. It is a minimum, so the element grows when its content is taller. Optional. |
| `top` | `boolean \| undefined` | Put the content at the top of the element (the default). Optional. |
| `middle` | `boolean \| undefined` | Put the content in the vertical middle of the element. Use with `height`. Optional. |
| `bottom` | `boolean \| undefined` | Put the content at the bottom of the element. Use with `height`. Optional. |
