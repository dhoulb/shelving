# Block

- Kind: component
- Import: `import { Block } from "shelving/ui";`

Plain `<div>` block with block-level spacing.
- Pass `as` to render a different semantic element (`section`, `header`, `footer`, `nav`, `aside`, `figure`).

## Signatures

```ts
Block({ as: Element = "div", children, className, ...props }: BlockProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `BlockProps` |  |
| `.as` | `BlockElement \| undefined` | Element this `<Block>` renders as, e.g. "header" to output a "<header>" Defaults to `"div"`. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Block as="aside" width="narrow"><Paragraph>Sidebar</Paragraph></Block>
```
