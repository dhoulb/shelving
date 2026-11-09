# DocumentationPlaygroundPage

- Kind: component
- Import: `import { DocumentationPlaygroundPage } from "shelving/ui";`

Page where you can write TSX and CSS and see the result run live, like the TypeScript Playground.
- The TSX tab holds code that can import from `shelving/*`, `react`, and `react-dom`. Its top-level expressions are shown in the preview.
- The CSS tab holds CSS that is added after the shelving styles, so you can change any shelving variable.
- The Variables tab lists every CSS variable that shelving components read, grouped by the module that owns it, ready to add to the CSS.
- The code and CSS are kept in the URL hash, so you can share a link to what you made.
- The preview is a `<DocumentationFrame>`, so it uses the raw shelving styles and not the docs site styles.

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
