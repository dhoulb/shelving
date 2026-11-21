# mergeMetaLinks()

- Kind: function
- Import: `import { mergeMetaLinks } from "shelving/ui";`

Merge two meta `<link>` lists, resolving the new hrefs to absolute URIs.

- New links are resolved relative to current URL (relative paths) and root URL (absolute paths).

## Signatures

```ts
mergeMetaLinks(current: MetaLinks | undefined, next: PossibleMetaLinks | undefined, url: ImmutableURL | undefined, root: ImmutableURL | undefined, caller: AnyCaller = mergeMetaLinks): MetaLinks | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `current` | `MetaLinks \| undefined` | The existing resolved links. |
| `next` | `PossibleMetaLinks \| undefined` | The new (possibly relative) links to merge on top. |
| `url` | `ImmutableURL \| undefined` | The current page URL, used to resolve relative hrefs. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |
| `root` | `ImmutableURL \| undefined` | The root URL, used to resolve absolute hrefs. |
| `.href` | `URLString` | Read only. |
| `.origin` | `URLString` | Read only. |
| `.pathname` | `AbsolutePath` | Read only. |
| `caller` | `AnyCaller` | Function to attribute thrown URL-resolution errors to (defaults to `mergeMetaLinks`). Defaults to `mergeMetaLinks`. |

## Returns

| Type | Description |
| --- | --- |
| `MetaLinks \| undefined` | The merged resolved links, or `undefined` if there was nothing to merge. |
