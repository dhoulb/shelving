# SearchTreeOptions

- Kind: interface
- Import: `import { SearchTreeOptions } from "shelving/util/tree";`

Options for `searchTree()`.

## Signatures

```ts
{
	readonly limit?: number | undefined;
	readonly filter?: Query | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `limit` | `number \| undefined` | Maximum number of results to return (defaults to `20`). Read only. Optional. |
| `filter` | `Query \| undefined` | Optional `Query` narrowing the candidates by *any* prop before ranking — the same shape `queryItems()` takes. - e.g. `{ kind: "method" }` to only rank methods, or `{ source: "…" }` to constrain by source. Read only. Optional. |
