# Panel

- Kind: component
- Import: `import { Panel } from "shelving/ui";`

Full-width vertical region that paints the current surface colour. Use to break a page into stacked
sections. Has zero block-space (Panels butt against each other); set its vertical breathing room
with the `padding` variant (`<Panel padding="large">`, `<Panel padding="xxlarge">` etc.).

Renders as a `<section>` by default; pass `as="header"` etc. for other semantic elements.
Set `plain` to remove the background, or `solid` for a strong fill.

A full-width vertical region that paints the current surface colour. Use panels to break a page into stacked bands: each one butts against its neighbours (zero block margin) but carries generous vertical padding, so a page becomes a sequence of coloured sections.

**Things to know:**

- A panel always spans the full width of its container. To constrain the content inside, compose a `<Block>` `width="narrow"` (or `width="wide"`) within it.
- Block margin is always zero so panels stack flush; control the vertical breathing room with the `padding` variant (`<Panel padding="large">`, `<Panel padding="none">`).
- Inline padding ("indent") keeps content off the edges by default. Override it per-property with `--panel-indent`, or change it with the shared `indent` variant (`<Panel indent="large">`, `<Panel indent="none">`).
- Trims the outer margins of its first and last children, so its padding is not doubled. Set `trim={false}` to keep them.
- It is `display: flow-root`, so the margins of its children stay inside it, also with `padding="none"`.
- `plain` removes the background but keeps the spacing, so plain and painted panels line up. `color=` still tints the content of a plain panel.
- `solid` paints a strong fill (`--tint-50`) with light text, for a hero or call-to-action band.
- `color=` / `status=` move the tint anchor for the whole panel scope, so the surface and text re-derive together and cascade into nested content.
- Panels have 1px top and bottom borders by default. Set `--panel-stroke` to `0` to remove them; the first and last panel drop them so the page doesn't gain stray edge lines.

## Usage

### Page banded into panels

```tsx live
import { Panel, Block, ResetLayout, Title, Paragraph } from "shelving/ui";

<ResetLayout>
	<Panel as="header" color="primary">
		<Block width="narrow">
			<Title>Welcome</Title>
		</Block>
	</Panel>
	<Panel padding="large">
		<Block width="narrow">
			<Paragraph>Each panel is a full-width band; the inner block constrains the content.</Paragraph>
		</Block>
	</Panel>
</ResetLayout>;
```

### Plain and solid panels

```tsx live
import { Block, Button, Panel, Paragraph, ResetLayout, Title } from "shelving/ui";

<ResetLayout>
	<Panel solid color="primary">
		<Block width="narrow" trim>
			<Title>Solid</Title>
			<Paragraph>A strong fill for the most important band.</Paragraph>
		</Block>
	</Panel>
	<Panel plain>
		<Block width="narrow" trim>
			<Paragraph>A plain panel has no background, but its content lines up with the painted panels.</Paragraph>
			<Button solid>Get started</Button>
		</Block>
	</Panel>
	<Panel>
		<Block width="narrow" trim>
			<Paragraph>A normal panel paints a light surface.</Paragraph>
		</Block>
	</Panel>
</ResetLayout>;
```

## Styling

`Panel` paints from the [tint ladder](/ui/TINT_CLASS); apply `color=` / `status=` (on the panel or an ancestor scope) to recolour the whole scope at once — surface and text re-derive together — or reach for a per-property hook for a single change.

| Variable                   | Styles                                                      | Default                                    |
| -------------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| `--panel-background`       | Surface fill                                                | `var(--tint-90)`                           |
| `--panel-color`            | Text colour                                                 | `var(--tint-00)`                           |
| `--panel-plain-background` | Surface fill of a `plain` panel                             | `transparent`                              |
| `--panel-solid-background` | Surface fill of a `solid` panel                             | `var(--tint-50)`                           |
| `--panel-solid-color`      | Text colour of a `solid` panel                              | `var(--tint-100)`                          |
| `--panel-border`           | Top/bottom border shorthand                                 | `var(--panel-stroke) solid var(--tint-80)` |
| `--panel-stroke`           | Border thickness — set `0` to hide the border               | `var(--stroke-normal)` (1px)               |
| `--panel-padding`          | Block padding (top + bottom)                                | `var(--space-section)` (2rem)              |
| `--panel-indent`           | Inline padding (left + right) keeping content off the edges | `var(--space-normal)` (16px)               |

**Global tokens it reads:** the tint-ladder steps `--tint-00` / `--tint-50` / `--tint-80` / `--tint-90` / `--tint-100`, plus `--space-section`, `--space-normal`, and `--stroke-normal`. The shared `padding` variant overrides `--panel-padding`; the shared `indent` variant overrides `--panel-indent`.


## Signatures

```ts
Panel({ as: Element = "section", plain, solid, children, className, ...props }: PanelProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `PanelProps` |  |
| `.as` | `BlockElement \| undefined` | Element this `<Panel>` renders as, e.g. "header" to output a "<header>" Defaults to `"section"`. |
| `.plain` | `boolean \| undefined` | Remove the background, but keep the spacing. `color=` and `status=` still tint the content. Optional. |
| `.solid` | `boolean \| undefined` | Paint a strong fill (`--tint-50`) with light text, for example for a hero or call-to-action band. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
