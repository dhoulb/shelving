# requireMeta()

- Kind: function
- Import: `import { requireMeta } from "shelving/ui";`

Read the current `Meta` context, optionally merging in additional meta data.

- Must be called inside a component or hook (reads context via React's `use()`).

## Signatures

```ts
requireMeta(meta?: PossibleMeta): Meta
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `meta` | `PossibleMeta` | A set of new possible meta data to combine into the current meta context. Optional. |
| `.root` | `PossibleURL \| undefined` | Base URL for the app — accepts a string or `URL`, resolved with `requireURL()`. Defaults to the origin of `url` when unset. Read only. Optional. |
| `.url` | `PossibleURI \| undefined` | New URL for the page. - Resolved using `requireURL()` if set relative to `root` Read only. Optional. |
| `.params` | `PossibleURIParams \| undefined` | Set the params in the URL (not merged with existing params). - Added to `url` after it is resolved. - Baseically Read only. Optional. |
| `.links` | `PossibleMetaLinks \| undefined` | Read only. Optional. |
| `.modules` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `.scripts` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `.stylesheets` | `PossibleMetaAssets \| undefined` | Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `Meta` | The current `Meta`, with `meta` merged in when provided. |

## Examples

```ts
const { title, url } = requireMeta();
```
