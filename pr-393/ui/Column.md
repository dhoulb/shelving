# Column

- Kind: component
- Import: `import { Column } from "shelving/ui";`

Flex container that stacks its children as a column by default.

## Signatures

```ts
Column({ as: Element = "div", children, column = true, className, ...props }: ColumnProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ColumnProps` |  |
| `.as` | `BlockElement \| undefined` | Element this `<Column>` renders as, e.g. "header" to output a "<header>" Defaults to `"div"`. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Column gap="small">{items}</Column>
```
