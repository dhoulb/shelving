# Article

- Kind: component
- Import: `import { Article } from "shelving/ui";`

`<article>` block with section-level spacing.
- Use a `<Card>` instead to display boxed content.

## Signatures

```ts
Article({ as: Element = "article", children, ...variants }: SectionProps): ReactElement
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
