# Grid

A grid container that arranges its children in equal-width columns. Renders a `<div>` by default. Use it for tiles, cards, badges, or a calendar of days. For one row or one column of items, use `<Row>` or `<Column>`.

**Things to know:**

- Set `columns` to `1` to `8`. The default is `2`. Each column has the same width, and long content cannot make one column wider.
- Set `gap` to change the space between cells. The grid sets the outer margin of each child to `0`, so a child's `space` variant has no effect. Each child also trims the outer margins of its own content, like the `trim` variant.
- Pass `as` to render a different element. Use `as="ul"` or `as="ol"` for a list of items, and give each child as an `<li>`. The grid removes the list markers.
- It composes the standard block variants (`space`, `padding`, `indent`, `width`, `color`, and typography). See `getGridClass()` for the grid variants.

## Usage

### Two columns of cards

```tsx live
import { Card, Grid, Paragraph } from "shelving/ui";

<Grid gap="small">
	<Card>
		<Paragraph>Running</Paragraph>
	</Card>
	<Card>
		<Paragraph>Cycling</Paragraph>
	</Card>
	<Card>
		<Paragraph>Swimming</Paragraph>
	</Card>
	<Card>
		<Paragraph>Rowing</Paragraph>
	</Card>
</Grid>;
```

### A list of tiles

```tsx live
import { Card, Grid, Subheading, Tag } from "shelving/ui";

const BADGES = [
	{ name: "First run", color: "red" },
	{ name: "10 km", color: "orange" },
	{ name: "Early bird", color: "yellow" },
	{ name: "Streak", color: "green" },
	{ name: "Hills", color: "blue" },
	{ name: "Night owl", color: "purple" },
] as const;

<Grid as="ul" columns={3} gap="small">
	{BADGES.map(({ name, color }) => (
		<li key={name}>
			<Card color={color} padding="small">
				<Subheading space="none">{name}</Subheading>
				<Tag color={color}>Badge</Tag>
			</Card>
		</li>
	))}
</Grid>;
```

### A calendar

```tsx live
import { Card, Grid, Small } from "shelving/ui";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

<Grid as="ol" columns={7} gap="xsmall">
	{DAYS.map((day, i) => (
		<li key={`day-${i}`}>
			<Small>{day}</Small>
		</li>
	))}
	{Array.from({ length: 28 }, (_, i) => (
		<li key={i}>
			<Card space="none" padding="xsmall" indent="xsmall" color={i % 7 > 4 ? "gray" : "primary"}>
				{i + 1}
			</Card>
		</li>
	))}
</Grid>;
```

## Styling

`Grid` has no own hooks. It reads `--grid-gap` from `getGridClass()` (the space between cells, default `var(--space-small)`), and the block variants from `getBlockClass()`.
