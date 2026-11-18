# RouteCache

- Kind: component
- Import: `import { RouteCache } from "shelving/ui";`

Keep-alive page cache for the pages in the navigation stacks. Put it in a layout's content slot, around a `<Scroll vertical cover>` box.

- Put a page transition around it, and a `<Scroll vertical cover>` inside it, so each kept page scrolls in its own box.
- Keeps each page in the stacks mounted but hidden (with React's `<Activity>`), so going back to a page, or switching back to a tab, shows it exactly as you left it.
- Each page is keyed by its stack and its depth in that stack, not by its URL. So `NavigationStore.replace()` (a canonical URL, an in-page tab) keeps the same page mounted, and the same URL open in two tabs is two separate pages.
- A page leaves the cache as soon as it leaves its stack: when you go back from it, or when a stack is popped to its root. After a browser back, a browser forward shows that page fresh.
- The root page and the top page of each listed stack are never dropped. Other pages, and every floating page, can be dropped past `maxCached`, and show fresh (from the top) when you come back to them.
- When the current page is deeper than its stack's root and the root page is not cached (for example after a deep link), the root page is rendered hidden, so a swipe-back can show it.
- Each kept page is frozen under its own `<MetaContext>` and `NavigationPositionContext`, so the same `children` element renders a different page for each URL, and a hidden page never re-renders for another page's URL.
- `<Activity mode="hidden">` keeps a hidden page's state but unmounts its effects, so its subscriptions and timers pause and resume as it is hidden and shown.
- Without the browser Navigation API (older browsers, server renders), or with `maxCached` of `0`, it renders the current page directly with no cache.

A keep-alive cache for the pages in the navigation stacks. Put it in a layout's content slot, around a `<Scroll vertical cover>` box. It keeps each page in the stacks mounted but hidden (with React's [`<Activity>`](https://react.dev/reference/react/Activity)), so when you go back to a page, or switch back to a tab, the page is exactly as you left it: scroll position, toggles, searches, form input and focus.

Layouts do not include a cache. The app composes it, so it can also choose the transition, or leave the cache out.

**Things to know:**

- Each page is keyed by its stack and its depth in that stack, not by its URL. See `NavigationStore` for how stacks work.
- A page leaves the cache when it leaves its stack: when you go back from it, or when its stack goes back to the root. So a page you went back from mounts fresh the next time you open it.
- After a browser back, the browser forward button shows the next page fresh (from the top), because that page left its stack when you went back.
- The root page and the top page of each listed stack are never dropped, so each tab always shows the page you left, and always has its root below. Other pages, and every floating page, are dropped (least recently used first) past `maxCached`, and mount fresh when you come back to them.
- When the current page is deeper than its stack's root and the root page is not cached (for example after a deep link), the cache renders the root page hidden, so a swipe-back can show it. A hidden page runs no effects until it is shown.
- `NavigationStore.replace()` and `className="replace"` links keep the same page mounted. A replace to another URL for the same component (for example from `/post/1` to `/post/2`) keeps its state. To reset the state, wrap the page content in an element with a `key`, for example `<Fragment key={id}>`.
- The same URL open in two stacks is two separate pages.
- A form that makes something stays in the cache with its input. Clear it after a successful submit, so it is empty the next time you see it (see the example below).
- Each kept page is frozen under its own `<Meta>` and `NavigationPositionContext`, so a hidden page never re-renders for another page's URL.
- `<Activity mode="hidden">` keeps a hidden page's state but unmounts its effects, so subscriptions, observers (for example infinite scroll) and timers pause and resume as the page is hidden and shown.
- **Nesting:** layout, then transition, then `<RouteCache>`, then `<Scroll vertical cover>`, then `<PageLoader>`, then `<Router>`. See the usage below.
- The scroll box goes **inside** the cache, so each kept page has its own scroll box and keeps its own scroll position. A scroll box outside the cache is shared by every page, so pages lose their scroll.
- Put a page `<Transition>` **around** the `<RouteCache>`, not inside it. Safari (iOS 18) loses the exit animation when each page has its own `<ViewTransition>`.
- Keep the layout **outside** the cache. Chrome in the layout (a sidebar, a tab bar) then has one copy, keeps its own state, and plays its own CSS transitions. Chrome inside the cache gets one copy per kept page.
- Without the browser Navigation API, or with `maxCached={0}`, there is no cache: the current page renders directly and unmounts when you leave it.

## Usage

```tsx
import { AppLayout, HorizontalTransition, PageLoader, RouteCache, Router, Scroll } from "shelving/ui";

<AppLayout nav={<StackBar />}>
	<HorizontalTransition>
		<RouteCache>
			<Scroll vertical cover>
				<PageLoader>
					<Router routes={ROUTES} />
				</PageLoader>
			</Scroll>
		</RouteCache>
	</HorizontalTransition>
</AppLayout>;
```

Keep fewer pages:

```tsx
<RouteCache maxCached={5}>
	<Scroll vertical cover>
		<Router routes={ROUTES} />
	</Scroll>
</RouteCache>;
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
| `.maxCached` | `number \| undefined` | Number of pages to keep mounted (but hidden), so the whole state of each one (scroll position, toggles, searches, form input, focus) is still there when you come back to it. - The root page and the top page of each listed stack are never dropped, even past the limit, so a tab always shows the page you left and always has its root below. - Floating pages get no such protection. - Set to `0` (or less) to turn the cache off and unmount each page as you leave it. Read only. Defaults to `10`. |
| `.children` | `ReactNode` | The content to render for the current page and keep alive (hidden) for the other pages in the stacks. Read only. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |
