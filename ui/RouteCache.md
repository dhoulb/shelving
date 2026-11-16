# RouteCache

- Kind: component
- Import: `import { RouteCache } from "shelving/ui";`

Keep-alive page cache for the pages in the navigation stacks. Drop it into a layout around its scrolling content region.

- Keeps each page in the stacks mounted but hidden (with React's `<Activity>`), so going back to a page, or switching back to a tab, shows it exactly as you left it.
- Each page is keyed by its stack and its depth in that stack, not by its URL. So `NavigationStore.replace()` (a canonical URL, an in-page tab) keeps the same page mounted, and the same URL open in two tabs is two separate pages.
- A page leaves the cache as soon as it leaves its stack: when you go back from it, or when a stack is popped to its root. After a browser back, a browser forward shows that page fresh.
- The top page of each stack is never dropped. Other pages can be dropped past `maxCached`, and show fresh (from the top) when you come back to them.
- Each kept page is frozen under its own `<MetaContext>`, so the same `children` element renders a different page for each URL, and a hidden page never re-renders for another page's URL.
- `<Activity mode="hidden">` keeps a hidden page's state but unmounts its effects, so its subscriptions and timers pause and resume as it is hidden and shown.
- Without the browser Navigation API (older browsers, server renders), or with `maxCached` of `0`, it renders the current page directly with no cache.

A keep-alive cache for the pages in the navigation stacks. Put it in a layout around the scrolling content region. It keeps each page in the stacks mounted but hidden (with React's [`<Activity>`](https://react.dev/reference/react/Activity)), so when you go back to a page, or switch back to a tab, the page is exactly as you left it: scroll position, toggles, searches, form input and focus.

`<SidebarLayout>` and `<CenteredLayout>` already wrap their content in a `<RouteCache>`. Use it by hand only in a custom layout.

**Things to know:**

- Each page is keyed by its stack and its depth in that stack, not by its URL. See `NavigationStore` for how stacks work.
- A page leaves the cache when it leaves its stack: when you go back from it, or when its stack goes back to the root. So a page you went back from mounts fresh the next time you open it.
- After a browser back, the browser forward button shows the next page fresh (from the top), because that page left its stack when you went back.
- The top page of each stack is never dropped, so each tab always shows the page you left. Other pages are dropped (least recently used first) past `maxCached`, and mount fresh when you come back to them.
- `NavigationStore.replace()` and `className="replace"` links keep the same page mounted. A replace to another URL for the same component (for example from `/post/1` to `/post/2`) keeps its state. To reset the state, wrap the page content in an element with a `key`, for example `<Fragment key={id}>`.
- The same URL open in two stacks is two separate pages.
- A form that makes something stays in the cache with its input. Clear it after a successful submit, so it is empty the next time you see it (see the example below).
- Each kept page is frozen under its own `<Meta>`, so a hidden page never re-renders for another page's URL.
- `<Activity mode="hidden">` keeps a hidden page's state but unmounts its effects, so subscriptions, observers (for example infinite scroll) and timers pause and resume as the page is hidden and shown.
- The cache must wrap the scroll container itself to keep each page's scroll. So it goes in the layout around the scrolling column, not inside the router. Chrome outside the cache (a sidebar, a tab bar) is not duplicated or remounted.
- Put a page `<Transition>` around the `<RouteCache>`, not inside it. Safari (iOS 18) loses the exit animation when each page has its own `<ViewTransition>`.
- Without the browser Navigation API, or with `maxCached={0}`, there is no cache: the current page renders directly and unmounts when you leave it.

## Usage

```tsx
import { HorizontalTransition, RouteCache, Router } from "shelving/ui";

function MyLayout() {
  return (
    <HorizontalTransition>
      <RouteCache>
        <main className="scroll">
          <Router routes={ROUTES}/>
        </main>
      </RouteCache>
    </HorizontalTransition>
  );
}
```

Keep fewer pages:

```tsx
<RouteCache maxCached={5}>
  <Router routes={ROUTES}/>
</RouteCache>
```

Clear a create form after it saves. Change the `key` of the `<Form>`, so it mounts again with no input:

```tsx
import { useState } from "react";
import { Form, requireNavigation } from "shelving/ui";

function NewPostPage() {
  const nav = requireNavigation();
  const [formKey, setFormKey] = useState(0);
  return (
    <Form
      key={formKey}
      schema={POST_SCHEMA}
      onSubmit={async data => {
        const id = await createPost(data);
        setFormKey(k => k + 1);
        nav.forward(`/post/${id}`);
      }}
    />
  );
}
```

For a plain HTML `<form>`, call `form.reset()` after the submit.


## Signatures

```ts
RouteCache({ maxCached = 10, children }: RouteCacheProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `RouteCacheProps` |  |
| `.maxCached` | `number \| undefined` | Number of pages to keep mounted (but hidden), so the whole state of each one (scroll position, toggles, searches, form input, focus) is still there when you come back to it. - The top page of each stack is never dropped, even past the limit, so a tab always shows the page you left. - Set to `0` (or less) to turn the cache off and unmount each page as you leave it. Read only. Defaults to `10`. |
| `.children` | `ReactNode` | The content to render for the current page and keep alive (hidden) for the other pages in the stacks. Read only. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |
