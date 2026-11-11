# DocumentationPlaygroundPage

- Kind: component
- Import: `import { DocumentationPlaygroundPage } from "shelving/ui";`

Page where you can write TSX and CSS and see the result run live, like the TypeScript Playground.
- It fills the whole window: the editor is on the left, in a grey panel, and the preview fills the right.
- Drag the edge between them (or focus it and press the arrow keys) to change their widths.
- The TSX tab holds code that can import from `shelving/*`, `react`, and `react-dom`. Its top-level expressions are shown in the preview.
- The CSS tab holds CSS that is added after the shelving styles, so you can change any shelving variable.
- "Insert" opens a `<DocumentationPlaygroundInsert>` panel. On the TSX tab it lists the shelving components, and on the CSS tab the CSS variables. Press one to insert it at the cursor.
- The code and CSS are kept in the URL hash, so you can share a link to what you made.
- The preview is a `<DocumentationFrame>`, so it uses the raw shelving styles and not the docs site styles.
- It has no sidebar of its own. `<DocumentationApp>` renders it outside its `<SidebarLayout>`.

## Signatures

```ts
DocumentationPlaygroundPage(): ReactNode
```

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<Router routes={{ "/playground": DocumentationPlaygroundPage }} />
```
