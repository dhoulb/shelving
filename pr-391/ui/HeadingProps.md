# HeadingProps

- Kind: interface
- Import: `import { HeadingProps } from "shelving/ui";`
- Extends: `BlockVariants`

Props shared by `<Title>`, `Heading`, and `<Subheading>` — colour, space, and typography variants plus a heading-level override.

## Signatures

```ts
{
	level?: "1" | "2" | "3" | "4" | "5" | "6" | 1 | 2 | 3 | 4 | 5 | 6;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `level` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | Heading level (`1`–`6`) — sets the rendered `<h1>`–`<h6>` tag. Avoid overriding this in practice: pick the component that matches the level — `<Title>` (`<h1>`), `Heading` (`<h2>`), or `<Subheading>` (`<h3>`) — so the visual size and the document outline stay in step. Optional. |
