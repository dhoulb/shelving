# Column

- Kind: component
- Import: `import { Column } from "shelving/ui";`

Flex container that stacks its children as a column by default.

A flex container that stacks its children in a column. Renders a `<div>` by default. Use it to stack items with an even gap. For a row of items, use `<Row>`.

**Things to know:**

- Set `gap` to change the space between items. The default is `--space-small`.
- `top`, `middle`, `bottom`, `between` and `around` place the items down the column. `left`, `center` and `right` align them across it.
- The column sets the outer margin of each child to `0`, so a child's `space` variant has no effect. Use `gap`.
- Pass `as` to render a different element, for example `as="ul"`.
- See `getFlexClass()` for every flex variant.

## Usage

### Stack items with an even gap

```tsx live
import { Button, Column, Paragraph, Subheading } from "shelving/ui";

<Column gap="xsmall">
	<Subheading>Storage</Subheading>
	<Paragraph>1.2 GB of 5 GB used.</Paragraph>
	<Button solid color="primary" onClick={() => {}}>
		Upgrade
	</Button>
</Column>;
```

### Centre the items

```tsx live
import { Button, Column, Paragraph } from "shelving/ui";

<Column center>
	<Paragraph>Centred across the column.</Paragraph>
	<Button onClick={() => {}}>Centred</Button>
</Column>;
```

## Styling

`<Column>` has no own hooks. It reads `--space-small` (the default gap) and the `--space-*` token that its `gap` variant sets.


## Signatures

```ts
Column({ as: Element = "div", children, column = true, className, ...props }: ColumnProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ColumnProps` |  |
| `.as` | `BlockElement \| undefined` | Element this `<Column>` renders as, e.g. "header" to output a "<header>" Defaults to `"div"`. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
