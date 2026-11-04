# TreeCards

- Kind: component
- Import: `import { TreeCards } from "shelving/ui";`

Render a list of tree elements as a stack of cards.

- Each element is dispatched via `<TreeCardMapper>` to its registered renderer; each card links to its own stamped `path`.
- To override the renderer for a specific element type, wrap in `<TreeCardMapping mapping={…}>`.

## Signatures

```ts
TreeCards({ children }: TreeCardsProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `TreeCardsProps` |  |
| `.children` | `TreeElements` | The children to render as cards. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<TreeCards>{element.props.children}</TreeCards>
```
