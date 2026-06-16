# RouteCache

A keep-alive page cache. Drop it into a layout around its scrolling content region: it reads the current URL from the surrounding [`<Meta>`](/ui/MetaContext) context and keeps a handful of recently-visited pages mounted but *hidden* (using React's [`<Activity>`](https://react.dev/reference/react/Activity)), so navigating back or forward to a page restores its entire DOM and component state — scroll position of every scroll container, open/closed toggles, in-progress searches, form inputs, focus — instead of remounting it fresh at the top.

Shelving's [`SidebarLayout`](/ui/SidebarLayout) and [`CenteredLayout`](/ui/CenteredLayout) already wrap their scrollable content column in one for you, so pages rendered inside them keep their state across navigation automatically. Reach for it by hand only when building a custom layout.

**Things to know:**

- Pages are kept in a least-recently-used map keyed by `path`. Once `maxCached` pages are retained the least-recently-visited one is unmounted (and loses its state). A never-seen or evicted page mounts fresh at the top.
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

## See also

- [`SidebarLayout`](/ui/SidebarLayout) / [`CenteredLayout`](/ui/CenteredLayout) — wrap their scrollable content column in a `<RouteCache>` for you
- [`Router`](/ui/Router) — matches a URL to a route; render it inside a `<RouteCache>` to keep pages alive
- [`Navigation`](/ui/Navigation) — drives the URL changes that move between cached pages
