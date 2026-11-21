# Row

A flex container that puts its children in a row. Renders a `<div>` by default. Use it for a group of buttons, a title with a tag, or any items side by side. For a stack of items, use `<Column>`. For equal columns, use `<Grid>`.

**Things to know:**

- Set `gap` to change the space between items. The default is `--space-small`.
- `left`, `center`, `right`, `between` and `around` place the items along the row. `top`, `middle` and `bottom` align them across it.
- A `center` row that is wider than its box starts at the left edge, so no item is cut off.
- Set `wrap` to put items that do not fit on the next line.
- The row sets the outer margin of each child to `0`, so a child's `space` variant has no effect. Use `gap`.
- Pass `as` to render a different element, for example `as="ul"`.
- See `getFlexClass()` for every flex variant.

## Usage

### Place the items

```tsx live
import { Button, Row } from "shelving/ui";

const click = () => {};

<Row left><Button onClick={click}>Left</Button><Button onClick={click}>Left</Button></Row>
<Row center><Button onClick={click}>Centre</Button><Button onClick={click}>Centre</Button></Row>
<Row right><Button onClick={click}>Right</Button><Button onClick={click}>Right</Button></Row>
<Row between><Button onClick={click}>Between</Button><Button onClick={click}>Between</Button></Row>
```

### A title with a tag and a button

```tsx live
import { Button, Card, Row, Subheading, Tag } from "shelving/ui";

<Card>
	<Row between middle>
		<Row gap="xsmall" middle>
			<Subheading space="none">Kitchen</Subheading>
			<Tag status="warning">In progress</Tag>
		</Row>
		<Button small onClick={() => {}}>
			Edit
		</Button>
	</Row>
</Card>;
```

### Wrap onto the next line

```tsx live
import { Row, Tag } from "shelving/ui";

const TAGS = ["Running", "Cycling", "Swimming", "Rowing", "Climbing", "Yoga", "Hiking", "Tennis", "Golf"];

<Row gap="xsmall" wrap>
	{TAGS.map(tag => (
		<Tag key={tag} color="primary">
			{tag}
		</Tag>
	))}
</Row>;
```

## Styling

`<Row>` has no own hooks. It reads `--space-small` (the default gap) and the `--space-*` token that its `gap` variant sets.
