# App

Root component for a client-side Shelving app. `<App>` applies the theme CSS class to `document.body` and provides a `Meta` context so every descendant can read or update page metadata.

Use `<App>` when mounting into an existing HTML page on the client. For server-side rendering where you need the full `<html>` document shell, use `<HTML>` instead.

## A minimal app

The smallest single-screen app — `<App>` wraps a layout and some content:

```tsx
import { App, FixedLayout, Paragraph, Scroll, Section, Title } from "shelving/ui";

function HelloApp() {
	return (
		<App app="My app">
			<FixedLayout>
				<Scroll vertical cover>
					<Section width="narrow">
						<Title>Hello</Title>
						<Paragraph>Welcome to the app.</Paragraph>
					</Section>
				</Scroll>
			</FixedLayout>
		</App>
	);
}
```

## A routed app

For a multi-page app, wrap the routes in `<Navigation>` and `<Router>`:

```tsx
import { App, Navigation, Router } from "shelving/ui";

export function MyApp() {
	return (
		<App app="My app" root="https://example.com/" url="/">
			<Navigation>
				<Router
					routes={{
						"/": HomePage,
						"/about": AboutPage,
					}}
				/>
			</Navigation>
		</App>
	);
}
```

**Setting a `root` URL on `<App>` is strongly recommended.** `root` is the base that site-absolute links and assets (`/favicon.png`, `/base.css`) resolve against, the `<base>` tag rendered by `<HTML>`, and the prefix `<Router>` strips when matching routes. When it's unset, merging a `url` into the meta context derives `root` from that URL's origin (e.g. `https://example.com/`) — a safe fallback for apps served from the domain root, but wrong for apps deployed under a sub-path, so set it explicitly whenever your app doesn't live at `/`.

`<App>` accepts all `PossibleMeta` props (`app`, `root`, `url`, `title`, `language`, `tags`, etc.) and merges them into the context it provides to children. On mount it adds the theme class to `document.body`, which activates the CSS custom property tokens defined in `App.module.css`; on unmount it removes it.

## Composing an app

An app is built from layers, each with one job. Write them in plain sight in `App.tsx`, from the outside in:

1. **Contexts**: `<App>`, your data contexts, `<Navigation>`, `<DialogsContext>`.
2. **App-level catcher**: a last resort, outside every layout.
3. **Layout picker**: your own component that picks the layout (and its props) from the session, the path, or any other state.
4. **Layout**: `<AppLayout>`, `<SidebarLayout>` or `<FixedLayout>`. It draws the chrome (tab bar, sidebar) and gives a content slot. It knows nothing about the cache.
5. **Content**: transition, then `<RouteCache>`, then `<Scroll vertical cover>`, then `<PageLoader>`, then `<Router>`. Put it in a small component of your own, and reuse it in each layout.
6. **Page**: `<Page>` with its title, then the page content. A page renders no layout.

Nesting rules:

- The layout sits **above** the router. A page, an error page or a loading state never renders a layout.
- The transition goes **around** `<RouteCache>`, not inside it.
- `<Scroll vertical cover>` goes **inside** `<RouteCache>`, so each page keeps its own scroll.
- Chrome that keeps state or animates (a tab bar, a sidebar) stays in the layout, **outside** the cache.
- All pages in one stack must share one layout, because they share one `<RouteCache>`. To change the chrome for some pages (hide the tab bar), change a layout prop from the picker, for example `nav={false}`. Swap to another layout only between sections you do not move back and forth in, such as log-in and the main app.

```tsx
import { useStore } from "shelving/react";
import {
	App,
	AppLayout,
	Catcher,
	DialogsContext,
	Dialogs,
	ErrorPage,
	FixedLayout,
	HorizontalTransition,
	Navigation,
	Notices,
	PageLoader,
	requireMetaURL,
	RouteCache,
	Router,
	type ErrorProps,
	type Routes,
	Scroll,
	StackButton,
} from "shelving/ui";

const STACKS = ["/home", "/discover", "/profile"] as const;

/** 1–2. Contexts and the app-level catcher. No layout here. */
export function MyApp() {
	const session = useStore(SESSION).value;
	return (
		<App key={session?.id ?? "out"} app="My app" root="https://example.com/">
			<Navigation stacks={STACKS} stack="/home">
				<DialogsContext>
					<Catcher as={AppError}>
						<Shell signedIn={!!session} />
					</Catcher>
					<Dialogs />
					<Notices />
				</DialogsContext>
			</Navigation>
		</App>
	);
}

/** 3–4. Pick the layout. Plain React, so any rule works. */
function Shell({ signedIn }: { signedIn: boolean }) {
	const { path } = requireMetaURL();
	if (!signedIn)
		return (
			<FixedLayout>
				<Content routes={LOGIN_ROUTES} />
			</FixedLayout>
		);
	return (
		<AppLayout nav={path.startsWith("/squad/") ? false : <StackBar />}>
			<Content routes={ROUTES} />
		</AppLayout>
	);
}

/** 5. The content of a layout's slot. */
function Content({ routes }: { routes: Routes }) {
	return (
		<HorizontalTransition>
			<RouteCache>
				<Scroll vertical cover>
					<PageLoader>
						<Router routes={routes} />
					</PageLoader>
				</Scroll>
			</RouteCache>
		</HorizontalTransition>
	);
}

/** The tab bar, in the layout, outside the cache. */
function StackBar() {
	return (
		<>
			<StackButton stack="/home" title="Home">
				<HomeIcon />
			</StackButton>
			<StackButton stack="/discover" title="Discover">
				<SearchIcon />
			</StackButton>
			<StackButton stack="/profile" title="Profile">
				<ProfileIcon />
			</StackButton>
		</>
	);
}

/** An error outside every layout: the app picks one here. */
function AppError({ reason }: ErrorProps) {
	return (
		<FixedLayout>
			<Scroll vertical cover>
				<ErrorPage reason={reason} />
			</Scroll>
		</FixedLayout>
	);
}
```

Layouts are optional. With no layout, the document body scrolls, which is fine for a simple site. Use a layout when the app scrolls inside its own boxes: it locks the body and gives a content slot. Every layout is a frame: none of them scroll or centre. A page centres its own content, for example with `<Block height="full" middle width="narrow">`.

For a documentation site, hand an extracted tree to `<TreeApp>` instead — see the `shelving/extract` guide.
