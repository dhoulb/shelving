# Row

- Kind: component
- Import: `import { Row } from "shelving/ui";`

Flex container that arranges its children as a row by default.

## Signatures

```ts
Row({ as: Element = "div", children, className, ...props }: RowProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `RowProps` |  |
| `.as` | `BlockElement \| undefined` | Element this `<Row>` renders as, e.g. "header" to output a "<header>" Defaults to `"div"`. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Row gap="small" center>{items}</Row>
```
