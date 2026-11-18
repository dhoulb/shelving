# AppLayout

- Kind: component
- Import: `import { AppLayout } from "shelving/ui";`

Layout with a content slot above a bar of the app's main sections, like the tab bar of a phone app.
- It is a frame only: the content slot does not scroll. Fill it with `<Scroll vertical cover>`, inside `<RouteCache>`, so each page scrolls in its own box.
- The bar sits below the content slot, not over it, and it stays still while a page slides.
- Set `nav={false}` to hide the bar, for example for a full-screen page. Change the prop in place (from the URL), so the layout and its page cache stay mounted.

A full-viewport layout with a content slot above a bar of the app's main sections, like the tab bar of a phone app. It is a frame only: it draws the bar and gives the content slot, and the app fills the slot.

**Things to know:**

- The content slot does not scroll. Fill it with `<Scroll vertical cover>` inside `<RouteCache>`, so each page scrolls in its own box and keeps its own scroll position.
- The bar sits below the content slot, not over it. So pages need no extra space at the bottom for the bar.
- The bar shows at every screen size.
- The bar paints above the content slot, so its shadow (`--app-layout-nav-shadow`) shows over the pages, even a page with its own background.
- The content slot stays clear of the notch and the rounded screen corners, and the bar stays clear of the home bar (safe-area insets).
- Each item in the bar takes an equal share of its width, up to `--app-layout-nav-item-width` each.
- The bar is outside the page cache, so it has one copy and keeps its state.
- The bar has no view-transition name of its own. Pages slide sideways in the content slot above it, so the bar stays still. A named bar would draw above a dialog or notice that covers it during every view transition.
- Leave out `nav`, or set it to `false`, to show no bar. The content slot then fills the screen. To hide the bar for some pages, change the prop from the URL, so the layout and its page cache stay mounted: `nav={path.startsWith("/squad/") ? false : <StackBar />}`.
- Pages, error pages and loading states never render it themselves. Pick it above the router. See "Composing an app" on `<App>`.

## Usage

```tsx
import { AppLayout, HorizontalTransition, PageLoader, RouteCache, Router, Scroll, StackButton } from "shelving/ui";

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

## Styling

| Variable                           | Styles                                                                                                                                                                                                         | Default                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `--app-layout-background`          | Page background while the layout is mounted                                                                                                                                                                    | `var(--tint-100)` (white)                   |
| `--app-layout-color`               | Text colour for the layout                                                                                                                                                                                     | `var(--tint-00)` (black)                    |
| `--app-layout-nav-background`      | Bar fill (also fills the home-bar area below it)                                                                                                                                                               | `var(--tint-100)` (white)                   |
| `--app-layout-nav-color`           | Bar text and icon colour                                                                                                                                                                                       | `var(--tint-00)` (black)                    |
| `--app-layout-nav-border`          | Line above the bar                                                                                                                                                                                             | `var(--stroke-normal) solid var(--tint-90)` |
| `--app-layout-nav-shadow`          | Shadow of the bar, for example a soft shadow above it                                                                                                                                                          | `none`                                      |
| `--app-layout-nav-transition-name` | View-transition name of the bar. Set it only for your own transition types (for example under `:root:active-view-transition-type(tab)`), so the bar stays above parts of a page that slide in their own layers | `none`                                      |
| `--app-layout-nav-item-width`      | Largest width of one bar item                                                                                                                                                                                  | `6rem`                                      |

The bar keeps its items clear of the home bar and the rounded screen corners with safe-area insets.

**Global tokens it reads** — `--tint-00`, `--tint-90`, `--tint-100`, and `--stroke-normal`.


## Signatures

```ts
AppLayout({ nav, children }: AppLayoutProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `AppLayoutProps` |  |
| `.nav` | `ReactNode` | Items for the bar below the content, for example a `<StackButton>` for each tab. Set `false` (or leave it out) to show no bar. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
