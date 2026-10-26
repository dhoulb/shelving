# RouteCacheProps

- Kind: interface
- Import: `import { RouteCacheProps } from "shelving/ui";`

Props for `<RouteCache>` — the `maxCached` size and the content `children` to keep alive per URL.

## Signatures

```ts
{
	readonly maxCached?: number | undefined;
	readonly children: ReactNode;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `maxCached` | `number \| undefined` | Number of recently-visited URLs to keep mounted (but hidden) so the entire state of their subtree — scroll position of every scroll container, open/closed toggles, in-progress searches, form inputs, focus — is restored intact when navigating back or forward to them. - Defaults to `10`. Once the limit is reached the least-recently-visited entry is unmounted. - Set to `0` (or less) to disable caching and unmount the subtree as you leave each URL. Read only. Optional. |
| `children` | `ReactNode` | The content to render for the current URL and keep alive (hidden) for recently-visited URLs. Read only. |
