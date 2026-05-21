# Layout

Page-level layout containers. Each layout occupies the full viewport and handles scroll, safe areas, and responsive behaviour so individual pages don't have to.

## Components

| Component | Purpose |
|---|---|
| `<SidebarLayout>` | Fixed-width side column next to a scrollable main column. Collapses to an off-canvas drawer on narrow screens. |
| `<CenteredLayout>` | Centers content horizontally with a narrow max-width. Good for login, registration, error, and focused-form pages. |

`Layout.ts` also exports `useSafeKeyboardArea()` — a hook that adjusts the `--layout-inset-bottom` CSS variable when the on-screen keyboard appears on iOS (a Safari workaround until `interactive-widget` viewport support lands).

## SidebarLayout

```tsx
import { SidebarLayout, Menu, MenuItem } from "shelving/ui";

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
      <Router routes={ROUTES}/>
    </SidebarLayout>
  );
}
```

Pass `right` to place the sidebar on the right. The sidebar renders as `<nav>`, so it is a navigation landmark without additional markup. Inside a `<Navigation>` context the drawer closes automatically on route change.

Override the sidebar width and background with CSS custom properties:

```css
--sidebar-layout-width: 280px;
--sidebar-layout-bg: var(--color-surface-2);
```

## CenteredLayout

```tsx
import { CenteredLayout, Section } from "shelving/ui";

function LoginPage() {
  return (
    <CenteredLayout>
      <Section narrow>
        <LoginForm/>
      </Section>
    </CenteredLayout>
  );
}
```

Pass `fullWidth` to remove the max-width constraint when centered positioning is still wanted but the content needs full width.

## Composing with the router

Layouts sit naturally inside `<Router>` route values. See the layout-wrapping pattern in [`router`](/ui/router) for examples of wrapping a group of routes in a shared layout.

## See also

- [`router`](/ui/router) — pattern for wrapping route groups in a shared layout
- [`menu`](/ui/menu) — `<Menu>` and `<MenuItem>` for sidebar navigation
- [`app`](/ui/app) — `<App>` wraps the outermost layout on the client
- [`page`](/ui/page) — `<HTML>` and `<Page>` sit above layouts in the tree
