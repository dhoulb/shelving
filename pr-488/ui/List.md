# List

- Kind: component
- Import: `import { List } from "shelving/ui";`

List block — wraps each child in an `<li>` and renders an `<ul>` or `<ol>`.
- Pass `ordered` to render an ordered `<ol>` instead of the default unordered `<ul>`.
- A `<ListItem>` child is not wrapped again.

A bulleted or numbered list. Renders a `<ul>` by default (or an `<ol>` when `ordered` is set) and wraps each child in its own `<li>`, so you pass the items as children rather than writing the `<li>` markup yourself.

**Things to know:**

- Pass `ordered` to render an `<ol>` with numbered markers; the default is an unordered `<ul>`.
- Each child becomes one list item — give it plain content, not an `<li>`. A `<ListItem>` child is not wrapped again, so use it to set the space or typography of one item.
- Items stay in normal flow. Each item has a 12px block margin (`--list-item-space`), and margins merge. A `<p>` inside an item (as in a loose Markdown list) brings its own 16px margin, so those items are 16px apart.
- Like the other block components it carries its own outer block margin, also as the first or last child. Set `space="none"` to remove it.
- Inside `<Prose>` a raw `<ul>` / `<ol>` picks up the same styling, so Markdown-rendered lists match component ones.

## Usage

### Unordered and ordered lists

```tsx live
import { List } from "shelving/ui";

<List>{["Apples", "Oranges", "Pears"]}</List>
<List ordered>{["First", "Second", "Third"]}</List>
```

### Space on one item

```tsx live
import { List, ListItem } from "shelving/ui";

<List>
	{[
		"Apples",
		"Oranges",
		<ListItem key="pears" space="large">
			Pears
		</ListItem>,
	]}
</List>;
```

## Styling

`List` paints from the [tint ladder](/ui/TINT_CLASS) for its markers only; apply `color=` (on the list or an ancestor scope) to recolour the markers, or reach for a per-property hook for a single change.

Override these hooks at `:root`. The tint hooks (`--list-marker-color`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable                | Styles                                                    | Default                                  |
| ----------------------- | --------------------------------------------------------- | ---------------------------------------- |
| `--list-space`          | Outer block margin (top + bottom)                         | `var(--space-paragraph)` (16px)          |
| `--list-item-space`     | Block margin of each `li`                                 | `var(--space-small)` (12px)              |
| `--list-indent`         | Inline start padding (marker gutter) of an unordered list | `1.125em`                                |
| `--list-ordered-indent` | Inline start padding of an ordered list                   | `calc(var(--list-indent) * 1.6)` (1.8em) |
| `--list-marker-color`   | Bullet / number colour                                    | `var(--tint-80)`                         |

**Global tokens it reads:** `--space-paragraph`, `--space-small`, and the tint-ladder step `--tint-80`.


## Signatures

```ts
List({ children, ordered = false, className, ...props }: ListProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ListProps` |  |
| `.children` | `ImmutableArray<ReactNode>` | Read only. |
| `.ordered` | `boolean \| undefined` | Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
