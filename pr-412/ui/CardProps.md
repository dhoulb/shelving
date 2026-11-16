# CardProps

- Kind: interface
- Import: `import { CardProps } from "shelving/ui";`
- Extends: `ClickableProps`

Props for `Card` — combines `ClickableProps` (for navigable cards) with colour, status, padding, space, typography, width, and shadow variants.

## Signatures

```ts
{
	as?: BlockElement | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `as` | `BlockElement \| undefined` | Element this `<Card>` renders as, e.g. "header" to output a "<header>" Defaults to `"article"`. |
