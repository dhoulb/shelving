# RouteCache

A keep-alive page cache. It renders the current page and keeps a handful of recently-visited pages mounted but *hidden* (using React's [`<Activity>`](https://react.dev/reference/react/Activity)), so navigating back or forward to a page restores its entire DOM and component state — scroll position of every scroll container, open/closed toggles, in-progress searches, form inputs, focus — instead of remounting it fresh at the top.

You rarely use `<RouteCache>` directly: [`Router`](/ui/Router) and [`TreeRouter`](/ui/TreeRouter) wrap their matched page in one for you via their `cache` prop. Reach for it by hand only when building a custom router.

**Things to know:**

- Pages are kept in a least-recently-used map keyed by `path`. Once `cache` pages are retained the least-recently-visited one is unmounted (and loses its state). A never-seen or evicted page mounts fresh at the top.
- Pass `cache={0}` (or less) to disable caching entirely — the page renders directly and unmounts as soon as you leave it.
- `<Activity mode="hidden">` preserves a hidden page's *state* while unmounting its *effects*, so subscriptions, observers (e.g. infinite-scroll), and timers pause and resume cleanly as the page is hidden and shown.
- Wrap the `children` in their own frozen `<Meta>` context so a hidden page is insulated from the live URL and never re-renders for someone else's page.
- For per-page **scroll** to be preserved, each page must own its scroll container — the scrollable element has to live *inside* the cached page, not in a shared layout wrapper that every route renders into.

## Usage

```tsx
import { MetaContext, RouteCache } from "shelving/ui";

<RouteCache path={path} cache={10}>
  <MetaContext value={meta}>
    <Page/>
  </MetaContext>
</RouteCache>
```

## See also

- [`Router`](/ui/Router) — matches a URL to a route and caches the result via its `cache` prop
- [`TreeRouter`](/ui/TreeRouter) — resolves a tree element to a page and caches it via its `cache` prop
- [`Navigation`](/ui/Navigation) — drives the URL changes that move between cached pages
