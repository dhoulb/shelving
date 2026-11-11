# TreeMenuProps

- Kind: interface
- Import: `import { TreeMenuProps } from "shelving/ui";`

Props for the `TreeMenu` component — the root tree element plus its URL path.

## Signatures

```ts
{
	readonly tree: TreeElement;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `tree` | `TreeElement` | Root element whose children become the navigation links. Must be a flattened element (from `useTreeMap()`) so each child carries its canonical `path`. Read only. |
