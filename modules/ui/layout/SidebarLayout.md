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
- The sidebar paints above the content slot, so its shadow (`--sidebar-layout-sidebar-shadow`) shows over the pages, even a page with its own background. The column is full height, so only the blur at the side of its shadow shows, over the content. A 1px tinted border (`--sidebar-layout-border`) divides the sidebar from the content by default.
- On a narrow screen the menu button floats at the top right of the content slot, above the page.
- Pages, error pages and loading states never render it themselves. Pick it above the router. See "Composing an app" on `<App>`.

## Usage

### A sidebar with a menu

The example shows in a wide window, so the sidebar is in a column. Open it in the playground and make the preview narrow to see the drawer.

```tsx live desktop "An app with a sidebar"
import { useState } from "react";
import { Button, Card, Field, Grid, Menu, MenuItem, Panel, Paragraph, Row, Scroll, SidebarLayout, Subheading, Table, Tag, TextInput, Title } from "shelving/ui";

const USERS = [
	{ name: "Alice", plan: "Pro", status: "success", label: "Active" },
	{ name: "Bob", plan: "Free", status: "warning", label: "Invited" },
	{ name: "Carol", plan: "Pro", status: "error", label: "Blocked" },
] as const;

function DashboardPage() {
	return (
		<Panel plain>
			<Title>Dashboard</Title>
			<Grid columns={3} gap="small">
				<Card><Subheading>Users</Subheading><Paragraph>1,204</Paragraph></Card>
				<Card><Subheading>Revenue</Subheading><Paragraph>£8,420</Paragraph></Card>
				<Card status="warning"><Subheading>Open issues</Subheading><Paragraph>7</Paragraph></Card>
			</Grid>
		</Panel>
	);
}

function UsersPage() {
	return (
		<Panel plain>
			<Row between>
				<Title>Users</Title>
				<Button solid color="primary" onClick={() => {}}>Invite</Button>
			</Row>
			<Table>
				<thead><tr><th>Name</th><th>Plan</th><th>Status</th></tr></thead>
				<tbody>
					{USERS.map(({ name, plan, status, label }) => (
						<tr key={name}><td>{name}</td><td>{plan}</td><td><Tag status={status}>{label}</Tag></td></tr>
					))}
				</tbody>
			</Table>
		</Panel>
	);
}

function SettingsPage() {
	const [name, setName] = useState("Shelving");
	return (
		<Panel plain>
			<Title>Settings</Title>
			<Field title="Site name">
				<TextInput name="name" value={name} onValue={setName} />
			</Field>
			<Button solid color="primary" onClick={() => {}}>Save</Button>
		</Panel>
	);
}

const PAGES = { Dashboard: <DashboardPage />, Users: <UsersPage />, Settings: <SettingsPage /> };

function App() {
	const [page, setPage] = useState<keyof typeof PAGES>("Dashboard");
	const sidebar = (
		<Panel plain>
			<Subheading>Admin</Subheading>
			<Menu>
				{Object.keys(PAGES).map(key => (
					<MenuItem key={key} selected={key === page} onClick={() => setPage(key as keyof typeof PAGES)}>
						{key}
					</MenuItem>
				))}
			</Menu>
		</Panel>
	);
	return (
		<SidebarLayout sidebar={sidebar}>
			<Scroll vertical cover>{PAGES[page]}</Scroll>
		</SidebarLayout>
	);
}

<App />;
```

### With a router

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

Override these hooks at `:root`. The tint hooks (`--sidebar-layout-background`, `--sidebar-layout-color`, `--sidebar-layout-border`, `--sidebar-layout-sidebar-background`, `--sidebar-layout-sidebar-color`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable                              | Styles                                                                      | Default                                         |
| ------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| `--sidebar-layout-width`              | Width of the side column (and drawer)                                       | `17.5rem`                                       |
| `--sidebar-layout-background`         | Page background while the layout is mounted (also fills the content column) | `var(--tint-100)` (white)                       |
| `--sidebar-layout-color`              | Text colour for the layout (set on `body`, inherited by the content column) | `var(--tint-00)` (black)                        |
| `--sidebar-layout-sidebar-background` | Sidebar column fill                                                         | `var(--tint-100)` (white, the same as the page) |
| `--sidebar-layout-sidebar-color`      | Sidebar column text colour                                                  | `var(--tint-00)` (black)                        |
| `--sidebar-layout-border`             | Border colour between the sidebar and the content                           | `var(--tint-90)`                                |
| `--sidebar-layout-stroke`             | Border width between the sidebar and the content                            | `var(--stroke-normal)` (1px)                    |
| `--sidebar-layout-sidebar-shadow`     | Shadow of the sidebar column on a wide screen                               | `var(--shadow-normal)`                          |
| `--sidebar-layout-shadow`             | Drop shadow of the open drawer on a narrow screen                           | `var(--shadow-large)`                           |

The sidebar scrolls on its own. The content slot does not scroll: its `<Scroll vertical cover>` box does.

**Global tokens it reads** — `--tint-00` / `--tint-90` / `--tint-100`, plus `--space-normal`, `--duration-normal`, `--stroke-normal`, `--shadow-normal`, `--shadow-large`, and `--color-backdrop`.
