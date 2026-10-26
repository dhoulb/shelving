# TreeLinkProps

- Kind: interface
- Import: `import { TreeLinkProps } from "shelving/ui";`
- Extends: `CodeProps`

Props for the `TreeLink` component — the element reference plus an optional label.

## Signatures

```ts
{
	readonly name: string;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Reference to an element in the tree — a flat key (`"BooleanSchema"`, `"Store.get"`) or a canonical path (`"/schema/BooleanSchema"`). Read only. |
