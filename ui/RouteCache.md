# RouteCache

- Kind: component
- Import: `import { RouteCache } from "shelving/ui";`

Keep-alive page cache keyed by the current URL — drop it into a layout around its scrolling content region.

- Reads the live URL from the surrounding `<Meta>` context and keeps up to `maxCached` recently-visited
  pages mounted but hidden (via React's `<Activity>`), so navigating back/forward to a page restores its
  entire DOM and component state — scroll position, toggles, searches, inputs, focus — untouched.
- Pages are kept in a least-recently-used map keyed by `path`; the oldest is unmounted past the limit.
- A page that owns other paths with `<RoutePath>` stays mounted when the URL changes to one of them.
- Each snapshot is frozen under its own `<MetaContext>`, so the same single `children` element resolves a
  different page per path and a hidden page never re-renders for someone else's URL.
- `<Activity mode="hidden">` preserves a hidden page's state while unmounting its effects, so its
  subscriptions/observers/timers pause and resume cleanly as it is hidden and shown.
- Because it wraps the scroll container itself (rather than sitting below it inside the router), the
  scroll position of every cached page is preserved — surrounding chrome (sidebar, drawer state) stays
  outside the cache, so it is neither duplicated nor remounted on navigation.
- When `maxCached <= 0` the page is rendered directly with no caching (it unmounts as you leave it).

A keep-alive page cache. Drop it into a layout around its scrolling content region: it reads the current URL from the surrounding `<Meta>` context and keeps a handful of recently-visited pages mounted but *hidden* (using React's [`<Activity>`](https://react.dev/reference/react/Activity)), so navigating back or forward to a page restores its entire DOM and component state — scroll position of every scroll container, open/closed toggles, in-progress searches, form inputs, focus — instead of remounting it fresh at the top.

Shelving's `<SidebarLayout>` and `<CenteredLayout>` already wrap their scrollable content column in one for you, so pages rendered inside them keep their state across navigation automatically. Reach for it by hand only when building a custom layout.

**Things to know:**

- Pages are kept in a least-recently-used map keyed by `path`. Once `maxCached` pages are retained the least-recently-visited one is unmounted (and loses its state). A never-seen or evicted page mounts fresh at the top.
- A page can own other paths with `<RoutePath>`, for example its tabs (`/dave/{tab}`). A navigation to one of those paths keeps the same page mounted: it keeps its scroll and state, and a `<ViewTransition>` around the page does not slide.
- Pass `maxCached={0}` (or less) to disable caching entirely — the page renders directly and unmounts as soon as you leave it.
- `<Activity mode="hidden">` preserves a hidden page's *state* while unmounting its *effects*, so subscriptions, observers (e.g. infinite-scroll), and timers pause and resume cleanly as the page is hidden and shown.
- Each snapshot is frozen under its own `<Meta>` context, so the same single `children` element resolves a different page per path and a hidden page never re-renders for someone else's URL.
- For per-page **scroll** to be preserved the cache has to wrap the scroll container itself — which is why it lives in the layout (around the scrollable column) rather than below it inside the router. Surrounding chrome (sidebar, drawer state) stays outside the cache, so it is neither duplicated nor remounted on navigation.

## Usage

```tsx
import { RouteCache } from "shelving/ui";

<SidebarLayout sidebar={<Menu/>}>
  <RouteCache>
    <Router routes={routes}/>
  </RouteCache>
</SidebarLayout>
```


## Signatures

```ts
RouteCache({ maxCached = 10, children }: RouteCacheProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `RouteCacheProps` |  |
| `.maxCached` | `number \| undefined` | Number of recently-visited URLs to keep mounted (but hidden) so the entire state of their subtree — scroll position of every scroll container, open/closed toggles, in-progress searches, form inputs, focus — is restored intact when navigating back or forward to them. - Defaults to `10`. Once the limit is reached the least-recently-visited entry is unmounted. - Set to `0` (or less) to disable caching and unmount the subtree as you leave each URL. Read only. Optional. |
| `.children` | `ReactNode` | The content to render for the current URL and keep alive (hidden) for recently-visited URLs. Read only. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |
