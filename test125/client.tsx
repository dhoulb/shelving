import { type ReactElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Block } from "../modules/ui/block/Block.js";
import { Card } from "../modules/ui/block/Card.js";
import { Heading } from "../modules/ui/block/Heading.js";
import { Paragraph } from "../modules/ui/block/Paragraph.js";
import { Title } from "../modules/ui/block/Title.js";
import { Button } from "../modules/ui/form/Button.js";
import { Code } from "../modules/ui/inline/Code.js";
import { Notice } from "../modules/ui/notice/Notice.js";

// Load the base design tokens (`--color-*`, `--space-*`, etc.) at `:root` for side effect.
import "../modules/ui/app/App.module.css";

// Theme file that sets per-component hooks (`--card-color-bg`, `--button-color-bg`, `--notice-color-bg`).
// With the new `:where()` rebind pattern, variants and ancestor-scope overrides should still beat the theme.
import "./theme.css";

function Page(): ReactElement {
	return (
		<Block narrow>
			<Title>Issue #125 — stress test</Title>
			<Paragraph>
				Every scenario below should render <em>correctly</em>: the theme hooks paint the default, variant classes (
				<Code>status="success"</Code>, <Code>red</Code>, <Code>primary</Code>) win on the element they're applied to, and an ancestor
				wrapping <Code>&lt;div&gt;</Code> that sets <Code>--color-surface</Code> is respected by anything without a theme hook or variant.
			</Paragraph>

			<Heading>1. Nested cards</Heading>
			<Card>
				<Paragraph>Outer: plain card (theme peach).</Paragraph>
				<Card>
					<Paragraph>Inner: plain card — should ALSO be theme peach.</Paragraph>
				</Card>
				<Card status="success">
					<Paragraph>Inner: success card — should be GREEN even inside the peach parent.</Paragraph>
				</Card>
			</Card>

			<Heading>2. Notices inside cards</Heading>
			<Card>
				<Notice>Plain notice inside plain card (theme cornsilk).</Notice>
				<Notice status="success">Success notice inside plain card (should be green).</Notice>
				<Notice status="error">Error notice inside plain card (should be red).</Notice>
			</Card>
			<Card status="error">
				<Notice>Plain notice inside ERROR card. Should pick up the notice theme (cornsilk), NOT inherit error red.</Notice>
				<Notice status="warning">Warning notice inside error card — should be its own warning colour.</Notice>
			</Card>

			<Heading>3. Code chips inside cards</Heading>
			<Card>
				<Paragraph>
					Plain card with <Code>code chip</Code> — chip should use the card's nested-surface tier (darker than the card itself), not the
					theme peach.
				</Paragraph>
			</Card>
			<Card status="success">
				<Paragraph>
					Success card with <Code>code chip</Code> — chip should still use the card's nested-surface, not inherit success green.
				</Paragraph>
			</Card>

			<Heading>4. Buttons in variant cards</Heading>
			<Card status="error">
				<Paragraph>Error card containing a button:</Paragraph>
				<Button>Plain button — should be theme lavender (button's own hook beats inheriting error from card).</Button>
				<Button success>Success button — should be GREEN (variant beats theme).</Button>
				<Button primary>Primary button — should be BLUE.</Button>
			</Card>

			<Heading>5. Custom ancestor that sets --color-surface</Heading>
			<div style={{ "--color-surface": "mistyrose", padding: "1rem", border: "2px dashed mistyrose" }}>
				<Paragraph>This wrapping div sets --color-surface = mistyrose on its scope.</Paragraph>
				<Card>
					<Paragraph>Card inside it — should use the THEME peach (own hook wins over ancestor's --color-surface).</Paragraph>
				</Card>
				<Button>Button inside it — same, should use theme lavender.</Button>
				<Notice>Notice inside it — should use theme cornsilk.</Notice>
				<Paragraph>
					Inline <Code>code chip</Code> — has no hook of its own; should pick up the ancestor's mistyrose.
				</Paragraph>
			</div>

			<Heading>6. Custom ancestor with NO theme hooks unset</Heading>
			<div style={{ "--color-surface": "mistyrose", "--card-color-bg": "initial", padding: "1rem", border: "2px dashed mistyrose" }}>
				<Paragraph>Same div, but also resets --card-color-bg to initial (as if no theme).</Paragraph>
				<Card>
					<Paragraph>Card — should now inherit mistyrose from the wrapper (no hook, inherit fallback kicks in).</Paragraph>
				</Card>
			</div>
		</Block>
	);
}

const root = document.body.appendChild(document.createElement("div"));
createRoot(root).render(
	<StrictMode>
		<Page />
	</StrictMode>,
);
