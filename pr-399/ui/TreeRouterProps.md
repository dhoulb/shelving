# TreeRouterProps

- Kind: interface
- Import: `import { TreeRouterProps } from "shelving/ui";`
- Extends: `PossibleMeta`

Props for the `TreeRouter` component — the tree to route plus an optional fallback and app meta.

## Signatures

```ts
{
	readonly fallback?: ReactElement | undefined | null;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `fallback` | `ReactElement \| undefined \| null` | Optional fallback element. - Explicit `null` means fallback to nothing (router will not throw `NotFoundError`). Read only. Optional. |
