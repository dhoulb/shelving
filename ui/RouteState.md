# RouteState

- Kind: interface
- Import: `import { RouteState } from "shelving/ui";`

The route state of one page, shared by `<Router>`, `<RouteCache>` and `<RoutePath>`.
- `path` is the template of the paths the page owns, set by `<RoutePath>`.
- `cache` is the page's `<RouteCache>` entry, so `<RoutePath>` in a top-level page also tells the cache.
- `router` marks a state made by `<Router>`, so a nested router does not pass the cache entry on.

## Signatures

```ts
{
	path?: AbsolutePath | undefined;
	readonly cache?: RouteState | undefined;
	readonly router?: true | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `path` | `AbsolutePath \| undefined` | Optional. |
| `cache` | `RouteState \| undefined` | Read only. Optional. |
| `router` | `true \| undefined` | Read only. Optional. |
