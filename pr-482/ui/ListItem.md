# ListItem

- Kind: component
- Import: `import { ListItem } from "shelving/ui";`

One item in a `<List>` — rendered as `<li>`.

One item in a list — renders an `<li>`. Use it inside `<List>`, or inside a raw `<ul>` / `<ol>`, when one item needs its own space, padding, trim, or typography.

**Things to know:**

- A plain `li` in a list already gets the list item space. `<ListItem>` adds the block variants on top (`space`, `padding`, `trim`, `size`, …).
- `<List>` does not wrap a `<ListItem>` child in a second `<li>`.
- Margins merge in normal flow. A `<p>` inside the item brings its own margin. Set `trim` to remove the outer margins of the first and last child.

## Usage

### Item with more space

```tsx live
import { List, ListItem } from "shelving/ui";

<List>
	{[
		"Apples",
		<ListItem key="oranges" space="large">
			Oranges
		</ListItem>,
		"Pears",
	]}
</List>;
```

### Item with paragraphs

```tsx live
import { List, ListItem, Paragraph } from "shelving/ui";

<List>
	{[
		<ListItem key="a" trim>
			<Paragraph>First paragraph.</Paragraph>
			<Paragraph>Second paragraph.</Paragraph>
		</ListItem>,
		"Pears",
	]}
</List>;
```

## Styling

`ListItem` has no hooks of its own. Its block margin comes from the parent list: `--list-item-space` on `<List>` (default `var(--space-small)`, 12px). The marker colour is `--list-marker-color` on `<List>`.

**Global tokens it reads:** `--space-small` (through the list).


## Signatures

```ts
ListItem({ children, className, ...props }: ListItemProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ListItemProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
