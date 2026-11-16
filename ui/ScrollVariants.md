# ScrollVariants

- Kind: interface
- Import: `import { ScrollVariants } from "shelving/ui";`

Variant props for a scroll region: which axes scroll, plus `cover` and `reverse`.

## Signatures

```ts
{
	vertical?: boolean | undefined;
	horizontal?: boolean | undefined;
	cover?: boolean | undefined;
	reverse?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `vertical` | `boolean \| undefined` | Vertical scrolling (defaults to `false`). Optional. |
| `horizontal` | `boolean \| undefined` | Horizontal scrolling (defaults to `false`). Optional. |
| `cover` | `boolean \| undefined` | Cover the nearest positioned ancestor (`position: absolute; inset: 0`), for example a layout's content slot (defaults to `false`). Optional. |
| `reverse` | `boolean \| undefined` | Start at the end and stay there as the content grows, for example a chat (defaults to `false`). Put the content in one child. Optional. |
