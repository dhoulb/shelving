# TreeElement

- Kind: interface
- Import: `import { TreeElement } from "shelving/util/tree";`
- Extends: `Element<P>`

Element in a heirarchical tree.
- Has a `tree-` prefixed type string.
- Requires a string `key` prop (can be resolved to a path).
- Props can include `title`, `description`, and/or `content` to be useful.

## Signatures

```ts
{
	readonly key: string;
	readonly type: `tree-${string}`;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `key` | `string` | Read only. |
| `type` | `` `tree-${string}` `` | Read only. |
