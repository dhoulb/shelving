# DocumentationPlaygroundInsertProps

- Kind: interface
- Import: `import { DocumentationPlaygroundInsertProps } from "shelving/ui";`

Props for `<DocumentationPlaygroundInsert>`.

## Signatures

```ts
{
	readonly type: "code" | "css";
	readonly onInsert: (text: string) => void;
	readonly onClose: () => void;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `type` | `"code" \| "css"` | What to list: shelving components for the TSX, or CSS variables for the CSS. Read only. |
| `onInsert` | `(text: string) => void` | Called with a `PlaygroundComponent.snippet` (for the TSX) or a CSS declaration or rule (for the CSS) when you press an item. Read only. |
| `onClose` | `() => void` | Called when the panel closes. It must unmount the panel. Read only. |
