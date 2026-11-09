# RouteState

- Kind: interface
- Import: `import { RouteState } from "shelving/ui";`

The route state of one page, shared by `<Router>`, `<RouteCache>` and `<RouteConfig>`.
- `path` is the template of the paths the page owns, set by `<RouteConfig path>`.
- `cache` is `false` when `<RouteCache>` drops the page as you leave it, set by `<RouteConfig cache>`.
- `entry` is the page's `<RouteCache>` entry, so `<RouteConfig>` in a top-level page also tells the cache.
- `router` marks a state made by `<Router>`, so a nested router does not pass the cache entry on.

## Signatures

```ts
{
	path?: AbsolutePath | undefined;
	cache?: boolean | undefined;
	readonly entry?: RouteState | undefined;
	readonly router?: true | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `path` | `AbsolutePath \| undefined` | Optional. |
| `cache` | `boolean \| undefined` | Optional. |
| `entry` | `RouteState \| undefined` | Read only. Optional. |
| `router` | `true \| undefined` | Read only. Optional. |
