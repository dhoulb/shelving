# getColorClass

The `color` variant prop moves the [tint ladder](/ui/TINT_CLASS) anchor to a named palette colour — `<Card color="red">`, `<Tag color="primary">`. It's an **override** for one-off recolouring of a component in a page; for an app-wide look, override the palette variables below in a theme file instead.

`getColorClass({ color })` returns `getClass(TINT_CLASS, "<colour>")` — it moves `--tint-50` to the chosen colour and recomposes the ladder, so the whole subtree retints. See `TINT_CLASS` for how the ladder works.

## Usage

Each row is one `color=` value. The card, tag, button and progress bar in the row all take the same colour.

```tsx live desktop "Every colour"
import { Button, Card, Progress, Row, Subheading, Tag } from "shelving/ui";

const COLORS = ["primary", "secondary", "tertiary", "red", "orange", "yellow", "green", "aqua", "blue", "purple", "pink", "gray"] as const;

<>
	{COLORS.map(color => (
		<Card key={color} color={color} padding="small">
			<Row between middle gap="small">
				<Subheading space="none">{color}</Subheading>
				<Row gap="small" middle>
					<Tag color={color}>Tag</Tag>
					<Progress color={color} value={60} />
					<Button color={color} small onClick={() => {}}>
						Button
					</Button>
					<Button color={color} small solid onClick={() => {}}>
						Button
					</Button>
				</Row>
			</Row>
		</Card>
	))}
</>;
```

## Theme variables

The following `:root` variables are defined by this module and can be overridden in a theme file to adjust default styling across the whole app. Override a palette colour to re-aim every variant and status that maps to it.

### Palette

| Variable         | Default                | Notes                                                         |
| ---------------- | ---------------------- | ------------------------------------------------------------- |
| `--color-gray`   | `oklch(60% 0.01 240)`  | Neutral anchor — also the default tint when nothing moves it. |
| `--color-red`    | `oklch(62% 0.2 30)`    |                                                               |
| `--color-orange` | `oklch(74% 0.157 60)`  |                                                               |
| `--color-yellow` | `oklch(86% 0.16 92)`   |                                                               |
| `--color-green`  | `oklch(72% 0.185 130)` |                                                               |
| `--color-aqua`   | `oklch(72% 0.121 185)` |                                                               |
| `--color-blue`   | `oklch(57% 0.216 260)` |                                                               |
| `--color-purple` | `oklch(58% 0.25 300)`  |                                                               |
| `--color-pink`   | `oklch(68% 0.239 350)` |                                                               |

### Semantic

| Variable           | Default               | Used for                                                                                |
| ------------------ | --------------------- | --------------------------------------------------------------------------------------- |
| `--color-link`     | `var(--color-blue)`   | Link colour.                                                                            |
| `--color-focus`    | `var(--color-blue)`   | Focus outlines.                                                                         |
| `--color-success`  | `var(--color-green)`  | `status="success"`.                                                                     |
| `--color-warning`  | `var(--color-orange)` | `status="warning"`.                                                                     |
| `--color-failure`  | `var(--color-red)`    | `status="error"` / `status="danger"`.                                                   |
| `--color-backdrop` | `#0006`               | The backdrop that dims the page behind `<Dialog>` and an open `<SidebarLayout>` drawer. |

### Brand

| Variable            | Default               | Used for             |
| ------------------- | --------------------- | -------------------- |
| `--color-primary`   | `var(--color-blue)`   | `color="primary"`.   |
| `--color-secondary` | `var(--color-purple)` | `color="secondary"`. |
| `--color-tertiary`  | `var(--color-pink)`   | `color="tertiary"`.  |
