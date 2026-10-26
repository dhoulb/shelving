# createMeta()

- Kind: function
- Import: `import { createMeta } from "shelving/ui";`

Create a fully-formed `Meta` from a `PossibleMeta`.

- Like `mergeMeta()` but with no previous `Meta` to merge into — initialises meta from scratch.

## Signatures

```ts
createMeta(meta: PossibleMeta, caller: AnyCaller = createMeta): Meta
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `meta` | `PossibleMeta` | The input `PossibleMeta` to resolve. |
| `.root` | `PossibleURL \| undefined` | Base URL for the app — accepts a string or `URL`, resolved with `requireURL()`. Defaults to the origin of `url` when unset. Read only. Optional. |
| `.url` | `PossibleURI \| undefined` | New URL for the page. - Resolved using `requireURL()` if set relative to `root` Read only. Optional. |
| `.params` | `PossibleURIParams \| undefined` | Set the params in the URL (not merged with existing params). - Added to `url` after it is resolved. - Baseically Read only. Optional. |
| `.links` | `PossibleMetaLinks \| undefined` | Read only. Optional. |
| `.modules` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `.scripts` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `.stylesheets` | `PossibleMetaAssets \| undefined` | Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute thrown URL-resolution errors to (defaults to `createMeta`). Defaults to `createMeta`. |

## Returns

| Type | Description |
| --- | --- |
| `Meta` | A new fully-resolved `Meta`. |

## Examples

```ts
createMeta({ app: "Manchester Runners", url: "https://run.com" })
```
