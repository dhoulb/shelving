# getGridClass()

- Kind: function
- Import: `import { getGridClass } from "shelving/ui";`

Get the grid layout class for a component from its grid variant props.

The grid variant props lay out a component's children in equal-width columns — `<Grid columns={3}>`. Use them for tiles, cards, badges, or a calendar of days.

`getGridClass({ columns, gap })` maps the props to grid classes (e.g. `columns={3}` → `columns-3`) and composes `getGapClass()` for the `gap` prop.

**Values:**

- `columns` — `1` to `8` equal-width columns. The default is `2`.
- `gap` — the space between cells, from the same scale as `getGapClass()`. The default is `--space-small`.

**Things to know:**

- Each column is `minmax(0, 1fr)`, so long content cannot push a column wider than the others. Use `truncate` (see `getTypographyClass()`) or wrapping to fit long text.
- The grid sets the outer margin of each child to `0`, so a child's `space` variant has no effect inside the grid. Use `gap` to space the cells.
- The grid removes list markers, so you can render it as a `<ul>` or `<ol>` with `<li>` children.

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--grid-gap` | Space between cells when no `gap` is set | `var(--space-small)` (12px) |

**Global tokens it reads:** `--space-small`, plus the `--space-*` token of the `gap` variant.


## Signatures

```ts
getGridClass({ columns = 2, ...variants }: GridVariants): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `GridVariants` |  |
| `.columns` | `ColumnsVariant \| undefined` | Number of equal-width columns. Defaults to `2`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The combined grid + gap class string. |

## Examples

```ts
getGridClass({ columns: 3, gap: "normal" })
```
