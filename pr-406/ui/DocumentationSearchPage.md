# DocumentationSearchPage

- Kind: component
- Import: `import { DocumentationSearchPage } from "shelving/ui";`

Page listing every element in the system in one flat, searchable view.

- A `<TextInput>` filters as you type; a row of kind checkboxes narrows by `kind` via `searchTree`'s `filter`.
- The kind checkboxes are multi-select — ticking several narrows to a `kind IN […]` filter; ticking none shows every kind.
- An empty query lists everything (capped at 100); a non-empty query ranks with `searchTree` and caps at 20.
- Reads the whole tree from the surrounding `<TreeProvider>` (the flattened map's root), so it works on every page.

## Signatures

```ts
DocumentationSearchPage(): ReactNode
```

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<Router routes={{ search: DocumentationSearchPage }} />
```
