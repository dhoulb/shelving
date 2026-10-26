# Figure

- Kind: component
- Import: `import { Figure } from "shelving/ui";`

`<figure>` block with section-level spacing.
- Pair with `<Caption>` for `<figcaption>` content.

## Signatures

```ts
Figure({ as: Element = "figure", children, ...variants }: SectionProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `SectionProps` |  |
| `.as` | `BlockElement \| undefined` | Element this `<Section>` renders as, e.g. "header" to output a "<header>" Defaults to `"section"`. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
