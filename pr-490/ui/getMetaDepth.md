# getMetaDepth()

- Kind: function
- Import: `import { getMetaDepth } from "shelving/ui";`

Get how many `<Page>` elements a meta is nested in (`0` outside any `<Page>`).

## Signatures

```ts
getMetaDepth(meta: Meta): number
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `meta` | `Meta` |  |
| `.root` | `ImmutableURL \| undefined` | Base URL for the app (used to resolve `url` and set as `<base>` tag in `<Head>`). Read only. Optional. |
| `.url` | `ImmutableURL \| undefined` | URL of the current page (used as the initial URL for routing, and as the page's canonical URL in `<Head>`). Read only. Optional. |
| `.stack` | `AbsolutePath \| null \| undefined` | Root path of the current stack (for example `"/home"`). Set it above `<Navigation>` to choose the stack the app opens in. `<Navigation>` publishes the live stack, which is `null` for a floating page. Read only. Optional. |
| `.ordinal` | `number \| undefined` | Position of the current page in its stack, where `0` is the root. `<Navigation>` publishes it, and `<RouteCache>` and `<Router>` key each page by its stack and ordinal. `undefined` without the Navigation API. Read only. Optional. |
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

## Returns

| Type | Description |
| --- | --- |
| `number` |  |
