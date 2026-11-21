# Scroll

A box that scrolls its content on one or both axes. Use it for a wide table on a small screen, or as the scroll box of each page in an app.

**Things to know:**

- Set `vertical`, `horizontal`, or both. With neither, the box clips its content and does not scroll.
- Set `cover` to fill the nearest positioned ancestor (`position: absolute; inset: 0`). A layout's content slot is positioned, so `<Scroll vertical cover>` fills it.
- A `cover` box pads its top by `--scroll-inset-top`, and the content scrolls up under that space. `<AppLayout>` and `<FixedLayout>` set it to the notch (the top safe-area inset). A `cover` box inside another one has no top inset.
- Set `reverse` to start at the end and stay there when the content grows, for example a chat. Put the content in one child: only the scroll is reversed, so the child keeps its own order. No script is needed.
- Overscroll stops at the box edge (`overscroll-behavior: none`), so a scroll inside the box never scrolls the page behind it.
- When the box has keyboard focus, it shows a focus outline.

## Usage

### A wide table

```tsx live
import { Scroll, Table } from "shelving/ui";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Swipe the table left and right.
<Scroll horizontal>
	<Table>
		<thead>
			<tr>
				<th>Team</th>
				{MONTHS.map(month => (
					<th key={month}>{month}</th>
				))}
			</tr>
		</thead>
		<tbody>
			{["Red", "Blue", "Green"].map((team, t) => (
				<tr key={team}>
					<td>{team}</td>
					{MONTHS.map((month, m) => (
						<td key={month}>{(t + 1) * (m + 3)}</td>
					))}
				</tr>
			))}
		</tbody>
	</Table>
</Scroll>;
```

### A centred row that can overflow

A `<Row center>` is centred while it fits. When it is wider than the box, it starts at the left edge and scrolls, so no item is cut off. Use this for a bar of tabs.

```tsx live
import { Button, Row, Scroll } from "shelving/ui";

const FEW = ["Posts", "Photos", "People"];
const MANY = ["Posts", "Photos", "People", "Places", "Events", "Groups", "Pages", "Videos"];

// Centred while it fits.
<Scroll horizontal>
	<Row center gap="xsmall">
		{FEW.map((label, i) => <Button key={label} small selected={i === 0} onClick={() => {}}>{label}</Button>)}
	</Row>
</Scroll>

// Starts at the left edge and scrolls when it is wider.
<Scroll horizontal>
	<Row center gap="xsmall">
		{MANY.map((label, i) => <Button key={label} small selected={i === 0} onClick={() => {}}>{label}</Button>)}
	</Row>
</Scroll>
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

### Use the top inset

A header with a background can go up behind the notch, so its colour reaches the top of the screen. Pull it up with a negative margin, and pad its content back down:

```css
.header {
	margin-top: calc(0px - var(--scroll-inset-top, 0px));
	padding-top: var(--scroll-inset-top, 0px);
}
```

Use this only on the first thing in the page. Other pages keep the empty space at the top.

### A chat

```tsx live
import { Card, Paragraph, Scroll } from "shelving/ui";

// The box starts at the newest message, at the bottom.
<div style={{ position: "relative", height: "20rem" }}>
	<Scroll vertical cover reverse>
		<div>
			{Array.from({ length: 20 }, (_, i) => (
				<Card key={i} padding="small" color={i % 2 ? "primary" : undefined}>
					<Paragraph>Message {i + 1}</Paragraph>
				</Card>
			))}
		</div>
	</Scroll>
</div>;
```

## Styling

| Variable                | Styles                                                                                         | Default                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `--scroll-focus-border` | Outline when the box has keyboard focus                                                        | `var(--stroke-focus) solid var(--color-focus)` |
| `--scroll-inset-top`    | Space at the top of a `cover` box that the content scrolls under (layouts set it to the notch) | `0px`                                          |

**Global tokens it reads** — `--stroke-focus`, `--stroke-normal`, and `--color-focus`.
