# mergeMetaAssets()

- Kind: function
- Import: `import { mergeMetaAssets } from "shelving/ui";`

Merge two meta asset lists (modules, scripts, stylesheets), resolving the new hrefs to absolute URIs.

- New assets are resolved relative to current URL (relative paths) and root URL (absolute paths).

## Signatures

```ts
mergeMetaAssets(current: MetaAssets | undefined, next: PossibleMetaAssets | undefined, url: ImmutableURL | undefined, root: ImmutableURL | undefined, caller: AnyCaller = mergeMetaAssets): MetaAssets | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `current` | `MetaAssets \| undefined` | The existing resolved assets. |
| `next` | `PossibleMetaAssets \| undefined` | The new (possibly relative) assets to append. |
| `url` | `ImmutableURL \| undefined` | The current page URL, used to resolve relative hrefs. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |
| `root` | `ImmutableURL \| undefined` | The root URL, used to resolve absolute hrefs. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |
| `caller` | `AnyCaller` | Function to attribute thrown URL-resolution errors to (defaults to `mergeMetaAssets`). Defaults to `mergeMetaAssets`. |

## Returns

| Type | Description |
| --- | --- |
| `MetaAssets \| undefined` | The combined resolved asset list, or `undefined` if there was nothing to merge. |
