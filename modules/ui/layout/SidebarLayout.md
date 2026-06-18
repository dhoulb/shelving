# SidebarLayout

A full-viewport layout with a fixed-width side column next to a scrollable main content column. The sidebar renders as a `<nav>` landmark — it almost always holds the primary navigation. On narrow viewports it collapses to an off-canvas drawer toggled by a single burger/close button.

**Things to know:**

- Pass `right` to place the sidebar on the right rather than the left.
- The sidebar renders as `<nav>`, so it is a navigation landmark without extra markup — drop a [`Menu`](/ui/Menu) inside it.
- While the drawer is open an overlay dims the page; clicking the overlay closes it.
- Inside a [`Navigation`](/ui/Navigation) context the drawer closes itself whenever the route changes (e.g. tapping a sidebar link).
- The layout owns scroll, padding, and safe-area insets so individual pages don't have to.

## Usage

```tsx
import { SidebarLayout, Menu, MenuItem, Router } from "shelving/ui";

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

Layouts compose naturally as [`Router`](/ui/Router) route values — wrap a group of routes in a shared layout, then route further inside it.

### Keyboard-aware safe area

[`useSafeKeyboardArea()`](/ui/useSafeKeyboardArea) (exported alongside the layouts) tracks the dynamic viewport and writes a `--layout-inset-bottom` custom property reflecting the space hidden behind the on-screen keyboard. This is an iOS Safari workaround until `interactive-widget` viewport support lands.

```tsx
import { useSafeKeyboardArea } from "shelving/ui";

useEffect(useSafeKeyboardArea, []);
```

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--sidebar-layout-width` | Width of the side column (and drawer) | `17.5rem` |
| `--sidebar-layout-background` | Page background while the layout is mounted | `var(--tint-100)` |
| `--sidebar-layout-sidebar-background` | Sidebar column fill | `var(--tint-90)` |
| `--sidebar-layout-content-background` | Main content column fill | `var(--tint-100)` |
| `--sidebar-layout-border` | Divider between sidebar and content | `var(--stroke-normal) solid var(--tint-80)` |

The content column composes the shared `.layout` behaviour, so it also reads the layout hooks `--layout-space`, `--layout-padding`, `--layout-inset-top` / `-bottom` / `-left` / `-right`, and `--layout-body-bg`.

**Global tokens it reads** — the tint ladder [`--tint-80`](/ui/TINT_CLASS) / [`--tint-90`](/ui/TINT_CLASS) / [`--tint-100`](/ui/TINT_CLASS), plus [`--space-normal`](/ui/getSpaceClass), [`--stroke-normal`](/ui/getStrokeClass), [`--duration-normal`](/ui/getDurationClass), and [`--color-shadow`](/ui/getColorClass).
