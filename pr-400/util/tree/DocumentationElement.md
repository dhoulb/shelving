# DocumentationElement

- Kind: interface
- Import: `import { DocumentationElement } from "shelving/util/tree";`
- Extends: `TreeElement<DocumentationElementProps>`

Element representing a documented code symbol.
- The `kind` prop distinguishes specific symbol types (function, class, property, etc.) without baking the list in.

## Signatures

```ts
{
	readonly type: "tree-documentation";
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `type` | `"tree-documentation"` | Read only. |
