# TreeAppProps

- Kind: interface
- Import: `import { TreeAppProps } from "shelving/ui";`
- Extends: `PossibleMeta`

Props for the `TreeApp` component — the tree to render plus optional extra routes and app meta.

## Signatures

```ts
{
	tree: TreeElement;
	sidebar?: ReactElement | undefined;
	routes?: Routes | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `tree` | `TreeElement` | The tree elements to display. |
| `sidebar` | `ReactElement \| undefined` | Override the sidebar for the tree app. Defaults to `<TreeSidebar />`. |
| `routes` | `Routes \| undefined` | Additional routes. Optional. |
