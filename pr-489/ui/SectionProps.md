# SectionProps

- Kind: interface
- Import: `import { SectionProps } from "shelving/ui";`
- Extends: `BlockProps`

Props for `Section` and its semantic siblings — colour, space, typography, and width variants plus an optional `as` element override.

## Signatures

```ts
{
	as?: BlockElement | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `as` | `BlockElement \| undefined` | Element this `<Section>` renders as, e.g. "header" to output a "<header>" Defaults to `"section"`. |
