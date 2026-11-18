# PossibleMeta

- Kind: interface
- Import: `import { PossibleMeta } from "shelving/ui";`
- Extends: `Omit<Meta, "root" | "url" | "links" | "scripts" | "modules" | "stylesheets">`

Input metadata that can be parsed and converted to a fully-resolved `Meta`.

## Signatures

```ts
{
	readonly root?: PossibleURL | undefined;
	readonly url?: PossibleURI | undefined;
	readonly params?: PossibleURIParams | undefined;
	readonly links?: PossibleMetaLinks | undefined;
	readonly modules?: PossibleMetaAssets | undefined;
	readonly scripts?: PossibleMetaAssets | undefined;
	readonly stylesheets?: PossibleMetaAssets | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `root` | `PossibleURL \| undefined` | Base URL for the app — accepts a string or `URL`, resolved with `requireURL()`. Defaults to the origin of `url` when unset. Read only. Optional. |
| `url` | `PossibleURI \| undefined` | New URL for the page. - Resolved using `requireURL()` if set relative to `root` Read only. Optional. |
| `params` | `PossibleURIParams \| undefined` | Set the params in the URL (not merged with existing params). - Added to `url` after it is resolved. - Baseically Read only. Optional. |
| `links` | `PossibleMetaLinks \| undefined` | Read only. Optional. |
| `modules` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `scripts` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `stylesheets` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
