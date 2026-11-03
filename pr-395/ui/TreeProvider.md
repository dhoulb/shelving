# TreeProvider

- Kind: component
- Import: `import { TreeProvider } from "shelving/ui";`

Provide a tree to descendants as a flattened lookup map (see `flattenTree()`).

- Flattens `tree` **once** (memoised) when set — not on every lookup in every element.
- Merges onto any parent `<TreeProvider>`'s map, so cross-references resolve across an entire nested set of trees; the outer (parent) tree wins on collision.

## Signatures

```ts
TreeProvider({ tree, children }: { readonly tree: TreeElement; readonly children: ReactNode }): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `{ readonly tree: TreeElement; readonly children: ReactNode }` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<TreeProvider tree={tree}>{children}</TreeProvider>
```
