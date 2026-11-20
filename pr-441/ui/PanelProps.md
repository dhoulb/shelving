# PanelProps

- Kind: interface
- Import: `import { PanelProps } from "shelving/ui";`
- Extends: `BlockVariants`

Props for `Panel` — colour, status, and typography variants plus optional `children`.

## Signatures

```ts
{
	as?: BlockElement | undefined;
	plain?: boolean | undefined;
	solid?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `as` | `BlockElement \| undefined` | Element this `<Panel>` renders as, e.g. "header" to output a "<header>" Defaults to `"section"`. |
| `plain` | `boolean \| undefined` | Remove the background, but keep the spacing. `color=` and `status=` still tint the content. Optional. |
| `solid` | `boolean \| undefined` | Paint a strong fill (`--tint-50`) with light text, for example for a hero or call-to-action band. Optional. |
