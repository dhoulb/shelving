# mergeMeta()

- Kind: function
- Import: `import { mergeMeta } from "shelving/ui";`

Merge a `PossibleMeta` onto an existing `Meta`, resolving URLs and assets in the process.

- `title` is merged with `joinTitles()`.
- `url` is resolved to an absolute URL, e.g. `./d/e/f` + `/a/b/c` becomes `https://d.com/a/b/c/d/e/f`
- `root` defaults to the origin of the resolved `url` (e.g. `https://x.com/`) when not set explicitly, so merged meta with a `url` always has a `root`.
- `stylesheets` and `links` hrefs newly set in `meta2` are absolutified against the merged `url`/`root`, so they stay correct no matter where they are later rendered.

## Signatures

```ts
mergeMeta(meta1: Meta, meta2: PossibleMeta, caller: AnyCaller = mergeMeta): Meta
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `meta1` | `Meta` | The existing fully-resolved `Meta` to merge into. |
| `.root` | `ImmutableURL \| undefined` | Base URL for the app (used to resolve `url` and set as `<base>` tag in `<Head>`). Read only. Optional. |
| `.url` | `ImmutableURL \| undefined` | URL of the current page (used to update history API and as the initial URL for routing). Read only. Optional. |
| `.app` | `string \| undefined` | Title of the entire application. Read only. Optional. |
| `.title` | `string \| undefined` | Title of the current page (set as `<title>` in `<Head>` Read only. Optional. |
| `.description` | `string \| undefined` | Description of the current page. Read only. Optional. |
| `.image` | `string \| undefined` | Read only. Optional. |
| `.language` | `string \| undefined` | Language code (used for `lang` tag in HTML). Read only. Optional. |
| `.csp` | `MetaCSP \| undefined` | Read only. Optional. |
| `.tags` | `MetaTags \| undefined` | Read only. Optional. |
| `.links` | `MetaLinks \| undefined` | Read only. Optional. |
| `.modules` | `MetaAssets \| undefined` | Read only. Optional. |
| `.scripts` | `MetaAssets \| undefined` | Read only. Optional. |
| `.stylesheets` | `MetaAssets \| undefined` | Read only. Optional. |
| `meta2` | `PossibleMeta` | The new `PossibleMeta` to apply on top. |
| `.root` | `PossibleURL \| undefined` | Base URL for the app — accepts a string or `URL`, resolved with `requireURL()`. Defaults to the origin of `url` when unset. Read only. Optional. |
| `.url` | `PossibleURI \| undefined` | New URL for the page. - Resolved using `requireURL()` if set relative to `root` Read only. Optional. |
| `.params` | `PossibleURIParams \| undefined` | Set the params in the URL (not merged with existing params). - Added to `url` after it is resolved. - Baseically Read only. Optional. |
| `.links` | `PossibleMetaLinks \| undefined` | Read only. Optional. |
| `.modules` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `.scripts` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `.stylesheets` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute thrown URL-resolution errors to (defaults to `mergeMeta`). Defaults to `mergeMeta`. |

## Returns

| Type | Description |
| --- | --- |
| `Meta` | A new fully-resolved `Meta` combining both inputs. |

## Examples

```ts
mergeMeta(currentMeta, { title: "Messages", url: "./messages" })
```
