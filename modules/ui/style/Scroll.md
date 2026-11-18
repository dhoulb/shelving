# Scroll

A box that scrolls its content on one or both axes. Use it for a wide table on a small screen, or as the scroll box of each page in an app.

**Things to know:**

- Set `vertical`, `horizontal`, or both. With neither, the box clips its content and does not scroll.
- Set `cover` to fill the nearest positioned ancestor (`position: absolute; inset: 0`). A layout's content slot is positioned, so `<Scroll vertical cover>` fills it.
- Set `reverse` to start at the end and stay there when the content grows, for example a chat. Put the content in one child: only the scroll is reversed, so the child keeps its own order. No script is needed.
- Overscroll stops at the box edge (`overscroll-behavior: none`), so a scroll inside the box never scrolls the page behind it.
- When the box has keyboard focus, it shows a focus outline.

## Usage

### A wide table

```tsx
import { Scroll, Table } from "shelving/ui";

<Scroll horizontal>
	<Table>…</Table>
</Scroll>;
```

### A scroll box for each page

Put `<Scroll vertical cover>` inside `<RouteCache>`, so each kept page has its own scroll box and keeps its own scroll position. The layout gives its content slot `position: relative`, and the scroll box fills it.

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

### A chat

```tsx
<Scroll vertical cover reverse>
	<div>{messages}</div>
</Scroll>;
```

## Styling

| Variable                | Styles                                  | Default                                        |
| ----------------------- | --------------------------------------- | ---------------------------------------------- |
| `--scroll-focus-border` | Outline when the box has keyboard focus | `var(--stroke-focus) solid var(--color-focus)` |

**Global tokens it reads** — `--stroke-focus`, `--stroke-normal`, and `--color-focus`.
