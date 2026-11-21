# Button

A clickable styled as a button. Renders an `<a href="">` when given `href`, or a `<button>` when given `onClick` — the shared `<Clickable>` primitive picks the element, so a button is always the right semantics for what it does.

**Things to know:**

- Content-width by default: it sizes to its label and never grows. Pass `full` to fill the available width (it then shrinks to share a row, down to the content floor).
- There are four looks:
  - **Default** — a pale fill of the tint colour with the tint colour as text. Use it for most actions.
  - **`solid`** — a strong fill of the tint colour with white text. Use it for the main action on a screen, such as a form's submit button.
  - **`plain`** — no fill or border until hover or focus. Use it for chrome-level actions, such as breadcrumbs and a dialog's close button.
  - **`outline`** — like `plain`, but with a border until hover or focus.
- On hover, `plain` and `outline` take the same fill as a hovered default button.
- `color=` / `status=` move the tint anchor, so they set the colour of every look. A colourless button stays a neutral grey.
- `selected` makes a group of buttons, such as tabs. `selected={true}` sets `aria-pressed` (or `aria-current` on a link) and keeps the button's normal look. `selected={false}` also drops the fill until hover or focus, like `plain`, so the selected button stands out. Leave it `undefined` for a button that is not in a group.
- Selected wins over `plain` and `outline`: a selected `plain` or `outline` button keeps the default fill (also on hover and focus). So a `plain` button with `selected` works as a toggle that shows when it is on.
- `small` tightens the padding.
- A button with an icon has less side padding: halfway between `--button-padding` and `--button-indent`. An icon has empty space inside its own box, so a full indent makes the button look too wide. CSS cannot see if the icon is before or after the text, so both sides change.
- `square` makes the button as wide as it is tall, with no left and right padding, so an icon or one character sits in the centre. It works with `small`.
- `round` is like `square`, but with fully round corners, so the button is a circle.
- It takes the block variants, like any block: `space` sets its outer margin (`space="none"` removes it), `padding` and `indent` set its inner padding, and `width` sizes it. A `padding` variant sets the padding but not the minimum height, which `--button-padding` sets.
- `getButtonClass(variants)` returns the same `className` the component composes — use it to style a non-`<button>` element as a button when `Button` itself doesn't fit.
- `className` attaches an app class to one button, merged after the computed classes so an app stylesheet wins — see `ClassProps`.

## Usage

### Colours and looks

Each row is a colour and each column is a look. Square and round buttons hold one icon.

```tsx live desktop "Every colour and look"
import { AddIcon } from "shelving/icon/AddIcon";
import { Button, Table } from "shelving/ui";

const COLORS = [
	undefined,
	"primary",
	"secondary",
	"tertiary",
	"red",
	"orange",
	"yellow",
	"green",
	"aqua",
	"blue",
	"purple",
	"pink",
	"gray",
] as const;
const click = () => {};

<Table padding="xsmall">
	<thead>
		<tr>
			<th>Colour</th>
			<th>Default</th>
			<th>Solid</th>
			<th>Outline</th>
			<th>Plain</th>
			<th>Square</th>
			<th>Round</th>
		</tr>
	</thead>
	<tbody>
		{COLORS.map(color => (
			<tr key={color ?? "none"}>
				<td>{color ?? "None"}</td>
				<td>
					<Button color={color} space="none" onClick={click}>
						Save
					</Button>
				</td>
				<td>
					<Button color={color} space="none" onClick={click} solid>
						Save
					</Button>
				</td>
				<td>
					<Button color={color} space="none" onClick={click} outline>
						Save
					</Button>
				</td>
				<td>
					<Button color={color} space="none" onClick={click} plain>
						Save
					</Button>
				</td>
				<td>
					<Button color={color} space="none" onClick={click} square title="Add">
						<AddIcon />
					</Button>
				</td>
				<td>
					<Button color={color} space="none" onClick={click} round solid title="Add">
						<AddIcon />
					</Button>
				</td>
			</tr>
		))}
	</tbody>
</Table>;
```

### Statuses and looks

`status=` sets the colour from the meaning of the action, like `color=`.

```tsx live desktop "Every status and look"
import { Button, STATUSES, Table } from "shelving/ui";

const click = () => {};

<Table padding="xsmall">
	<thead>
		<tr>
			<th>Status</th>
			<th>Default</th>
			<th>Solid</th>
			<th>Outline</th>
			<th>Plain</th>
		</tr>
	</thead>
	<tbody>
		{STATUSES.map(status => (
			<tr key={status}>
				<td>{status}</td>
				<td>
					<Button status={status} space="none" onClick={click}>
						Save
					</Button>
				</td>
				<td>
					<Button status={status} space="none" onClick={click} solid>
						Save
					</Button>
				</td>
				<td>
					<Button status={status} space="none" onClick={click} outline>
						Save
					</Button>
				</td>
				<td>
					<Button status={status} space="none" onClick={click} plain>
						Save
					</Button>
				</td>
			</tr>
		))}
	</tbody>
</Table>;
```

### States and sizes

Each row is a look and each column is a state or size.

```tsx live desktop "Every look in every state"
import { Button, Table } from "shelving/ui";

const LOOKS = [{ name: "Default" }, { name: "Solid", solid: true }, { name: "Outline", outline: true }, { name: "Plain", plain: true }];
const click = () => {};

<Table padding="xsmall">
	<thead>
		<tr>
			<th>Look</th>
			<th>Normal</th>
			<th>Small</th>
			<th>Selected</th>
			<th>Not selected</th>
			<th>Disabled</th>
		</tr>
	</thead>
	<tbody>
		{LOOKS.map(({ name, ...look }) => (
			<tr key={name}>
				<td>{name}</td>
				<td>
					<Button {...look} color="primary" space="none" onClick={click}>
						Save
					</Button>
				</td>
				<td>
					<Button {...look} color="primary" space="none" onClick={click} small>
						Save
					</Button>
				</td>
				<td>
					<Button {...look} color="primary" space="none" onClick={click} selected>
						Save
					</Button>
				</td>
				<td>
					<Button {...look} color="primary" space="none" onClick={click} selected={false}>
						Save
					</Button>
				</td>
				<td>
					<Button {...look} color="primary" space="none" disabled>
						Save
					</Button>
				</td>
			</tr>
		))}
	</tbody>
</Table>;
```

### Icon buttons

Put an icon before or after the label. A button with only an icon is `square` (or `round`), and needs a `title` for screen readers.

```tsx live "Buttons with icons"
import { AddIcon } from "shelving/icon/AddIcon";
import { CloseIcon } from "shelving/icon/CloseIcon";
import { MenuIcon } from "shelving/icon/MenuIcon";
import { RightIcon } from "shelving/icon/RightIcon";
import { Button, Column, Row } from "shelving/ui";

const click = () => {};

<Column gap="small">
	<Row gap="small" wrap>
		<Button onClick={click} solid color="primary">
			<AddIcon /> Add item
		</Button>
		<Button onClick={click}>
			Next <RightIcon />
		</Button>
	</Row>
	<Row gap="small" wrap>
		<Button onClick={click} square title="Menu">
			<MenuIcon />
		</Button>
		<Button onClick={click} square solid color="primary" title="Add">
			<AddIcon />
		</Button>
		<Button onClick={click} square outline title="Next">
			<RightIcon />
		</Button>
		<Button onClick={click} square plain title="Close">
			<CloseIcon />
		</Button>
	</Row>
	<Row gap="small" wrap>
		<Button onClick={click} round title="Menu">
			<MenuIcon />
		</Button>
		<Button onClick={click} round solid color="primary" title="Add">
			<AddIcon />
		</Button>
		<Button onClick={click} round outline title="Next">
			<RightIcon />
		</Button>
		<Button onClick={click} round plain title="Close">
			<CloseIcon />
		</Button>
	</Row>
	<Row gap="small" wrap>
		<Button onClick={click} small square title="Add">
			<AddIcon />
		</Button>
		<Button onClick={click} small round solid color="primary" title="Add">
			<AddIcon />
		</Button>
		<Button onClick={click} small>
			<AddIcon /> Add
		</Button>
	</Row>
</Column>;
```

### Actions and links

`onClick` makes a `<button>`, and `href` makes a link. A button with neither shows as text.

```tsx live
import { Button, notifySuccess, Notices } from "shelving/ui";

<Button onClick={() => notifySuccess("Saved")} solid color="primary">Save</Button>
<Button href="https://shelving.cc/" target="_blank">Open the docs</Button>
<Button onClick={() => Promise.reject("Could not delete")} status="error">Delete</Button>
<Notices />
```

### Spacing and size

```tsx live
import { Button } from "shelving/ui";

// No outer margin: it sits flush with the content around it.
<Button full space="none" onClick={() => {}}>
	Start
</Button>;
```

### A row of buttons

```tsx live
import { Button, Row } from "shelving/ui";

<Row gap="small" right>
	<Button plain onClick={() => {}}>
		Cancel
	</Button>
	<Button solid color="primary" onClick={() => {}}>
		Continue
	</Button>
</Row>;
```

### Tabs

```tsx live
import { useState } from "react";
import { Button, Row } from "shelving/ui";

const SECTIONS = [
	{ key: "posts", label: "Posts" },
	{ key: "photos", label: "Photos" },
	{ key: "people", label: "People" },
];

function Tabs() {
	const [section, setSection] = useState("posts");
	return (
		<Row gap="xsmall">
			{SECTIONS.map(({ key, label }) => (
				<Button key={key} small solid selected={key === section} onClick={() => setSection(key)}>
					{label}
				</Button>
			))}
		</Row>
	);
}

<Tabs />;
```

### A one-off treatment

```tsx
import { Button } from "shelving/ui";

// `.spongy-press` lives in the app's own stylesheet — use it for what the theme hooks below can't express.
<Button className="spongy-press" onClick={claim}>
	Claim
</Button>;
```

### Reusing the button class

```tsx live
import { getButtonClass } from "shelving/ui";

// Style an arbitrary element as a button.
<label className={getButtonClass({ color: "primary", solid: true, small: true })}>
	Upload
	<input type="file" hidden />
</label>;
```

## Styling

`Button` paints from the [tint ladder](/ui/TINT_CLASS). Apply `color=` / `status=` (on the button or an ancestor scope) to recolour the whole button, or use a per-property hook for one change.

`Button.module.css` declares every hook below in `@layer defaults`, so the rules read them with no fallback. Override a hook at `:root`. Override a **tint hook** at `:root, .tint`: these hooks read the ladder, so the module declares them again in every tint scope, and an override at `:root` alone does not reach a button inside a tint scope. The tint hooks are `--button-background`, `--button-text`, `--button-hover-background`, `--button-active-background`, the `--button-solid-*` colour hooks (including `--button-solid-border`), `--button-plain-text`, `--button-plain-hover-background`, `--button-plain-active-background`, `--button-outline-border`, `--button-selected-background` and `--button-selected-text`. Use `:root, .tint` also for any override whose value reads the ladder.

Each `--button-*-border` hook takes a colour, not a shorthand. `--button-stroke` sets the width of every border, so the style is always `solid`. For a dashed border or another one-off, use an app class (see the example above).

A hook whose default reads another hook (for example `--button-active-background` reads `--button-hover-background`) resolves where it is declared. So when you change the first hook in a smaller scope, also set the hooks that read it there.

`--button-padding` sets the top and bottom padding, and `--button-indent` the left and right. Each takes one length, not a shorthand.

Every button is at least as tall as a button with an icon, so buttons line up whether they have an icon or not, and at every text size. The minimum height is `--button-icon-size` plus two `--button-padding` plus two `--button-stroke`. It is calculated in the rule from those hooks, so it stays correct when a theme or a smaller scope changes them. It has no hook of its own: change the parts instead. The `small` variant uses `--button-small-padding` in the same formula. Inputs use the same formula, so an input and a button sit at the same height by default.

The `--button-*` colour hooks without a look in their name paint the default look. `solid` has its own `--button-solid-*` colour hooks.

`--button-shadow`, `--button-hover-transform` and the `--button-active-*` pressed-state hooks are static and apply to every button, with one exception: `plain` and `outline` never paint a box shadow in any state — they have no fill until hover, so a raised edge under them reads broken. The hover and pressed transforms still apply to them, so all buttons move together. `--button-transition` already covers animating the press and release.

`plain`, `outline` and `selected={false}` share the `--button-plain-*` hooks: `--button-plain-text` recolours the label, `--button-plain-hover-background` / `--button-plain-hover-border` paint the hover and focus state, and the `--button-plain-active-*` pair paints the pressed state. The hover fill falls back to `--button-hover-background`, so plain and outline buttons always hover like a default button. `--button-plain-border` sets the resting border of `plain` (transparent by default), and `--button-outline-border` sets the resting border of `outline`.

Backgrounds paint to the button's true edge: `background-origin` is set to `border-box`, so a gradient or image background in any state reaches through the transparent border instead of stopping short at the padding box.

| Variable                           | Styles                                                   | Default                                          |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| `--button-background`              | Surface fill                                             | `var(--tint-90)`                                 |
| `--button-hover-background`        | Surface fill on hover / focus                            | `var(--tint-85)`                                 |
| `--button-hover-border`            | Border colour on hover / focus                           | `transparent`                                    |
| `--button-hover-transform`         | Transform on hover / focus                               | `none`                                           |
| `--button-text`                    | Label colour                                             | `var(--tint-50)`                                 |
| `--button-border`                  | Border colour                                            | `transparent`                                    |
| `--button-stroke`                  | Border / outline thickness                               | `var(--stroke-normal)` (1px)                     |
| `--button-radius`                  | Corner radius                                            | `var(--radius-xsmall)` (8px)                     |
| `--button-padding`                 | Top and bottom padding (one length)                      | `var(--space-small)` (12px)                      |
| `--button-indent`                  | Left and right padding (one length)                      | `calc(var(--space-normal) * 1.25)` (20px)        |
| `--button-small-padding`           | Top and bottom padding when `small` (one length)         | `var(--space-xxsmall)` (4px)                     |
| `--button-small-indent`            | Left and right padding when `small` (one length)         | `var(--space-small)` (12px)                      |
| `--button-icon-size`               | Icon size, and the base of the minimum height            | `var(--size-icon)` (24px)                        |
| `--button-gap`                     | Gap between icon and label                               | `var(--space-small)` (12px)                      |
| `--button-small-gap`               | Gap between icon and label when `small`                  | `var(--space-xxsmall)` (4px)                     |
| `--button-space`                   | Outer block margin                                       | `var(--space-small)` (12px)                      |
| `--button-font`                    | Font family                                              | `var(--font-body)`                               |
| `--button-weight`                  | Font weight                                              | `var(--weight-normal)` (400)                     |
| `--button-size`                    | Font size                                                | `var(--size-normal)`                             |
| `--button-leading`                 | Line height                                              | `var(--leading-auto)`                            |
| `--button-shadow`                  | Box shadow (never on `plain`)                            | `none`                                           |
| `--button-active-background`       | Surface fill while pressed                               | `var(--button-hover-background)`                 |
| `--button-active-border`           | Border colour while pressed                              | `var(--button-hover-border)`                     |
| `--button-active-shadow`           | Box shadow while pressed                                 | `var(--button-shadow)`                           |
| `--button-active-transform`        | Transform while pressed                                  | `var(--button-hover-transform)`                  |
| `--button-transition`              | Transition                                               | `all var(--duration-fast)` (150ms)               |
| `--button-focus-border`            | Focus outline colour (width is `--stroke-focus`)         | `var(--color-focus)`                             |
| `--button-disabled-opacity`        | Opacity when disabled                                    | `0.5`                                            |
| `--button-solid-border`            | Border colour in every state when `solid`                | `var(--tint-45)` (one step darker than the fill) |
| `--button-solid-background`        | Surface fill when `solid`                                | `var(--tint-50)`                                 |
| `--button-solid-text`              | Label colour when `solid`                                | `var(--tint-100)` (white)                        |
| `--button-solid-hover-background`  | Surface fill on hover / focus when `solid`               | `var(--tint-55)`                                 |
| `--button-solid-active-background` | Surface fill while pressed when `solid`                  | `var(--button-solid-hover-background)`           |
| `--button-plain-text`              | Label colour when `plain` or `outline`                   | `var(--tint-50)`                                 |
| `--button-plain-border`            | Resting border colour when `plain`                       | `transparent`                                    |
| `--button-outline-border`          | Resting border colour when `outline`                     | `var(--tint-80)`                                 |
| `--button-unselected-background`   | Resting fill when `selected={false}`                     | `transparent`                                    |
| `--button-selected-background`     | Fill when `plain` or `outline` and selected              | `var(--button-background)` (`var(--tint-90)`)    |
| `--button-selected-text`           | Label colour when `plain` or `outline` and selected      | `var(--button-text)` (`var(--tint-50)`)          |
| `--button-plain-hover-background`  | Fill on hover / focus when `plain` or `outline`          | `var(--button-hover-background)`                 |
| `--button-plain-hover-border`      | Border colour on hover / focus when `plain` or `outline` | `var(--button-hover-border)`                     |
| `--button-plain-active-background` | Fill while pressed when `plain` or `outline`             | `var(--button-plain-hover-background)`           |
| `--button-plain-active-border`     | Border colour while pressed when `plain` or `outline`    | `var(--button-plain-hover-border)`               |

**Global tokens it reads:** the tint ladder `--tint-50` / `--tint-55` / `--tint-80` / `--tint-85` / `--tint-90` / `--tint-100`, plus `--size-icon`, `--space-normal`, `--space-small`, `--space-xxsmall`, `--radius-xsmall`, `--stroke-normal`, `--stroke-focus`, `--color-focus`, `--font-body`, `--weight-normal`, `--size-normal`, `--leading-auto`, and `--duration-fast`.

```css
/* Theme: pill-shaped buttons, with roomier inline padding. */
:root {
	--button-radius: 999px;
	--button-indent: var(--space-xlarge);
}
```

```css
/* Theme: outline buttons use the label colour for their edge. A tint hook, so override it at `:root, .tint`. */
:root,
.tint {
	--button-outline-border: var(--tint-50);
}
```

```css
/* Theme: buttons are raised and press down flat — `plain` and `outline` press down too but never casts a shadow. The shadows read the ladder, so override them at `:root, .tint`. */
:root,
.tint {
	--button-shadow: 0 0.25rem 0 var(--tint-30);
	--button-active-transform: translateY(0.2rem);
	--button-active-shadow: 0 0.05rem 0 var(--tint-30);
	--button-transition: all var(--duration-fast) cubic-bezier(0.34, 1.56, 0.64, 1);
}
```
