# Grid

A grid container that arranges its children in equal-width columns. Renders a `<div>` by default. Use it for tiles, cards, badges, or a calendar of days. For one row or one column of items, use `<Row>` or `<Column>`.

**Things to know:**

- Set `columns` to `1` to `8`. The default is `2`. Each column has the same width, and long content cannot make one column wider.
- Set `gap` to change the space between cells. The grid sets the outer margin of each child to `0`, so a child's `space` variant has no effect.
- Pass `as` to render a different element. Use `as="ul"` or `as="ol"` for a list of items, and give each child as an `<li>`. The grid removes the list markers.
- It composes the standard block variants (`space`, `padding`, `indent`, `width`, `color`, and typography). See `getGridClass()` for the grid variants.

## Usage

### Two columns of cards

```tsx
import { Card, Grid, Paragraph } from "shelving/ui";

<Grid gap="small">
  <Card><Paragraph>Running</Paragraph></Card>
  <Card><Paragraph>Cycling</Paragraph></Card>
  <Card><Paragraph>Swimming</Paragraph></Card>
  <Card><Paragraph>Rowing</Paragraph></Card>
</Grid>
```

### A list of tiles

```tsx
import { Grid } from "shelving/ui";

<Grid as="ul" columns={3} gap="normal">
  {badges.map(badge => <li key={badge.id}>{badge.name}</li>)}
</Grid>
```

### Days of the week

```tsx
import { Grid } from "shelving/ui";

<Grid as="ol" columns={7} gap="xsmall">
  {days.map(day => <li key={day.date}>{day.label}</li>)}
</Grid>
```

## Styling

`Grid` has no own hooks. It reads `--grid-gap` from `getGridClass()` (the space between cells, default `var(--space-small)`), and the block variants from `getBlockClass()`.
