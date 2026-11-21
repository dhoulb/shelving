# AppLayout

- Kind: component
- Import: `import { AppLayout } from "shelving/ui";`

Layout with a content slot above a bar of the app's main sections, like the tab bar of a phone app.
- It is a frame only: the content slot does not scroll. Fill it with `<Scroll vertical cover>`, inside `<RouteCache>`, so each page scrolls in its own box.
- The bar sits below the content slot, not over it.
- During a page slide, the bar stays still when both pages have it, and slides with its page when only one page has it.
- Render it once above the router, or let each page render its own layout inside `<RouteCache>`, so pages with no bar can use another layout.

A full-viewport layout with a content slot above a bar of the app's main sections, like the tab bar of a phone app. It is a frame only: it draws the bar and gives the content slot, and the app fills the slot.

**Things to know:**

- The content slot does not scroll. Fill it with `<Scroll vertical cover>` inside `<RouteCache>`, so each page scrolls in its own box and keeps its own scroll position.
- The bar sits below the content slot, not over it. So pages need no extra space at the bottom for the bar.
- The bar shows at every screen size.
- The bar paints above the content slot, so its shadow (`--app-layout-nav-shadow`) shows over the pages, even a page with its own background.
- The content slot stays clear of the rounded screen corners, and the bar stays clear of the home bar (safe-area insets).
- The content slot goes up to the top of the screen. It sets `--scroll-inset-top` to the notch, so the page's `<Scroll vertical cover>` starts its content below the notch, and the content scrolls up under it. A page can pull a full-bleed header up behind the notch: see "Use the top inset" on `<Scroll>`.
- Each item in the bar takes an equal share of its width, up to `--app-layout-nav-item-width` each.
- During a page slide (a `"forward"` or `"back"` transition), the bar has its own view-transition name, so it leaves the sliding page:
  - When both pages have a bar, the old bar fades into the new one in place, so the bar stays still.
  - When only one page has a bar (for example, a full-screen page with another layout), the bar slides with its page, so the page comes in or leaves as one piece.
- At other times the bar has no view-transition name, so it never draws above a dialog or notice that covers it.
- Leave out `nav`, or set it to `false`, to show no bar. The content slot then fills the screen.
- Put the layout in one of two places. See "Composing an app" on `<App>`:
  - **Above the router**, once. The bar has one copy and keeps its state. Every page has the bar.
  - **In each page**, inside `<RouteCache>`. Each page picks its own layout, for example `<FixedLayout>` for a full-screen chat with no bar. Keep the bar's state in a store, because each page has its own copy of the bar.

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

Override these hooks at `:root`. The tint hooks (`--app-layout-background`, `--app-layout-color`, `--app-layout-nav-border`, `--app-layout-nav-background`, `--app-layout-nav-color`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable                           | Styles                                                                                                                                                                                                                                                                                              | Default                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `--app-layout-background`          | Page background while the layout is mounted                                                                                                                                                                                                                                                         | `var(--tint-100)` (white)                      |
| `--app-layout-color`               | Text colour for the layout                                                                                                                                                                                                                                                                          | `var(--tint-00)` (black)                       |
| `--app-layout-nav-background`      | Bar fill (also fills the home-bar area below it)                                                                                                                                                                                                                                                    | `var(--tint-100)` (white)                      |
| `--app-layout-nav-color`           | Bar text and icon colour                                                                                                                                                                                                                                                                            | `var(--tint-00)` (black)                       |
| `--app-layout-nav-border`          | Top border colour of the nav bar                                                                                                                                                                                                                                                                    | `var(--tint-90)`                               |
| `--app-layout-nav-stroke`          | Top border width of the nav bar                                                                                                                                                                                                                                                                     | `var(--stroke-normal)` (1px)                   |
| `--app-layout-nav-shadow`          | Shadow of the bar, cast up over the pages. Set `none` to remove it                                                                                                                                                                                                                                  | `0 -0.25rem 1rem -0.25rem var(--shadow-color)` |
| `--app-layout-nav-transition-name` | View-transition name of the bar. Set it only for your own transition types (for example under `:root:active-view-transition-type(tab)`), so the bar stays above parts of a page that slide in their own layers. The named bar always paints above those layers, even one that only the new page has | `none`                                         |
| `--app-layout-nav-item-width`      | Largest width of one bar item                                                                                                                                                                                                                                                                       | `6rem`                                         |

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
