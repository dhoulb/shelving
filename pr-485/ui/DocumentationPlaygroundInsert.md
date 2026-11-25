# DocumentationPlaygroundInsert

- Kind: component
- Import: `import { DocumentationPlaygroundInsert } from "shelving/ui";`

Panel that slides in from the right of the playground, to insert a shelving component into the TSX, or a CSS variable into the CSS.
- Components come from `PLAYGROUND_COMPONENTS_PATH`, and variables from `PLAYGROUND_VARIABLES_PATH`. The docs build writes both.
- Items are grouped by module, and you can search them by name or description. Hover an item to see its description.
- Press an item to insert it and close the panel. A group of variables also has "Insert all", which inserts every variable in it.

## Signatures

```ts
DocumentationPlaygroundInsert({ type, onInsert, onClose }: DocumentationPlaygroundInsertProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationPlaygroundInsertProps` |  |
| `.type` | `"code" \| "css"` | What to list: shelving components for the TSX, or CSS variables for the CSS. Read only. |
| `.onInsert` | `(text: string) => void` | Called with a `PlaygroundComponent.snippet` (for the TSX) or a CSS declaration or rule (for the CSS) when you press an item. Read only. |
| `.onClose` | `() => void` | Called when the panel closes. It must unmount the panel. Read only. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |
