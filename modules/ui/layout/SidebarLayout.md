# SidebarLayout

A full-viewport layout with a fixed-width side column next to a content slot. The sidebar renders as a `<nav>` landmark — it almost always holds the primary navigation. On narrow viewports it collapses to an off-canvas drawer toggled by a single burger/close button.

**Things to know:**

- Pass `right` to place the sidebar on the right rather than the left.
- The sidebar renders as `<nav>`, so it is a navigation landmark without extra markup — drop a `<Menu>` inside it.
- While the drawer is open an overlay dims the page; clicking the overlay closes it.
- Under `prefers-reduced-motion: reduce` the drawer snaps open/closed instead of sliding off-canvas; the overlay keeps its dimming fade, which is opacity-only and therefore reduced-motion-safe.
- Inside a `<Navigation>` context the drawer closes itself whenever the route changes (e.g. tapping a sidebar link).
- It is a frame only. The content slot does not scroll: fill it with `<Scroll vertical cover>` inside `<RouteCache>`, so each page scrolls in its own box. Content put in the slot without a scroll box does not scroll.
- The sidebar stays outside the page cache, so it keeps its own scroll position and state as pages change.
- On a narrow screen the menu button floats at the top right of the content slot, above the page.
- Pages, error pages and loading states never render it themselves. Pick it above the router. See "Composing an app" on `<App>`.

## Usage

```tsx
import { Menu, MenuItem, PageLoader, RouteCache, Router, Scroll, SidebarLayout } from "shelving/ui";

function AppShell() {
	const nav = (
		<Menu>
			<MenuItem href="/dashboard">Dashboard</MenuItem>
			<MenuItem href="/users">Users</MenuItem>
			<MenuItem href="/settings">Settings</MenuItem>
		</Menu>
	);
	return (
		<SidebarLayout sidebar={nav}>
			<RouteCache>
				<Scroll vertical cover>
					<PageLoader>
						<Router routes={ROUTES} />
					</PageLoader>
				</Scroll>
			</RouteCache>
		</SidebarLayout>
	);
}
```

To slide pages, put a transition around the `<RouteCache>`, inside the layout. The sidebar is outside the transition, so it stays still.

## Styling

| Variable                              | Styles                                                                      | Default                                           |
| ------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------- |
| `--sidebar-layout-width`              | Width of the side column (and drawer)                                       | `17.5rem`                                         |
| `--sidebar-layout-background`         | Page background while the layout is mounted (also fills the content column) | `var(--tint-100)` (white)                         |
| `--sidebar-layout-color`              | Text colour for the layout (set on `body`, inherited by the content column) | `var(--tint-00)` (black)                          |
| `--sidebar-layout-sidebar-background` | Sidebar column fill                                                         | `var(--tint-90)` (one shade darker than the page) |
| `--sidebar-layout-sidebar-color`      | Sidebar column text colour                                                  | `var(--tint-00)` (black)                          |
| `--sidebar-layout-border`             | Divider between sidebar and content, e.g. `1px solid var(--tint-90)`        | `none`                                            |
| `--sidebar-layout-shadow`             | Drop shadow of the open drawer on a narrow screen                           | `var(--shadow-large)`                             |

The sidebar scrolls on its own. The content slot does not scroll: its `<Scroll vertical cover>` box does.

**Global tokens it reads** — `--tint-00` / `--tint-90` / `--tint-100`, plus `--space-normal`, `--duration-normal`, `--shadow-large`, and `--color-backdrop`.
