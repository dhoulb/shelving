# requireMetaURL()

- Kind: function
- Import: `import { requireMetaURL } from "shelving/ui";`

Read the current `Meta` context and derive URL helpers (`path` and `params`) from its `url`.

## Signatures

```ts
requireMetaURL(meta?: PossibleMeta, caller: AnyCaller = requireMetaURL): MetaURL
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
| `caller` | `AnyCaller` | Function to attribute thrown `RequiredError`s to (defaults to `requireMetaURL`). Defaults to `requireMetaURL`. |

## Returns

| Type | Description |
| --- | --- |
| `MetaURL` | A `Meta` object with a defined `url` and `root`, plus `path` and `params` properties combined in. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If the current meta has no `url` or no `root`. |
| `unknown` | RequiredError If the current meta `url` and `root` do not share a root (different origin, or `url` outside `root`'s path). |

## Examples

```ts
const { path, params } = requireMetaURL();
```
