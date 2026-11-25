# RouteCacheProps

- Kind: interface
- Import: `import { RouteCacheProps } from "shelving/ui";`

Props for `<RouteCache>`: the `maxCached` size and the content `children` to keep alive for each page in the stacks.

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
| `maxCached` | `number \| undefined` | Number of pages to keep mounted (but hidden), so the whole state of each one (scroll position, toggles, searches, form input, focus) is still there when you come back to it. - The root page and the last page you saw in each listed stack are never dropped, even past the limit, so a tab always shows the page you left and always has its root below. - Floating pages get no such protection. - Keep it at `2` or more, so a swipe-back can show the page below and still keep the page you are leaving. - Set to `0` (or less) to turn the cache off and unmount each page as you leave it. Read only. Defaults to `10`. |
| `children` | `ReactNode` | The content to render for the current page and keep alive (hidden) for the other pages in the stacks. Read only. |
