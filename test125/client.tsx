import { type ReactElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "../modules/ui/app/App.js";
import { Block } from "../modules/ui/block/Block.js";
import { Card } from "../modules/ui/block/Card.js";
import { Heading } from "../modules/ui/block/Heading.js";
import { Paragraph } from "../modules/ui/block/Paragraph.js";
import { Title } from "../modules/ui/block/Title.js";
import { Button } from "../modules/ui/form/Button.js";

// Theme file that exercises the bug: setting `--card-color-bg` and `--button-color-bg` at `:root`
// makes variant colours (status="success", colour="red", etc.) silently stop working.
import "./theme.css";

function Page(): ReactElement {
	return (
		<App app="test125">
			<Block narrow>
				<Title>Issue #125</Title>
				<Paragraph>
					The theme sets <code>--card-color-bg</code> and <code>--button-color-bg</code> at <code>:root</code>. The plain card and button
					below pick up the theme correctly. The success/red ones should switch colour from their variant — but the theme hooks
					short-circuit the <code>var()</code> fallback, so the variants silently lose.
				</Paragraph>

				<Heading>Plain card + button (theme applies)</Heading>
				<Card>
					<Paragraph>Card background should be the theme's peach.</Paragraph>
					<Button>Plain button (theme lavender)</Button>
				</Card>

				<Heading>Success card (should be green — bug: stays peach)</Heading>
				<Card status="success">
					<Paragraph>
						This card has <code>status="success"</code>. With no theme it would be green. With the theme it's still peach because{" "}
						<code>--card-color-bg</code> wins over the variant's <code>--color-surface</code>.
					</Paragraph>
					<Button status="success">Success button (should be green — stays lavender)</Button>
				</Card>

				<Heading>Red card with primary button (both broken)</Heading>
				<Card red>
					<Paragraph>
						This card has the <code>red</code> colour variant and contains a <code>primary</code> button. Both should pick up their variant
						colour; both silently fall back to the theme.
					</Paragraph>
					<Button primary>Primary button (should be blue)</Button>
				</Card>
			</Block>
		</App>
	);
}

const root = document.body.appendChild(document.createElement("div"));
createRoot(root).render(
	<StrictMode>
		<Page />
	</StrictMode>,
);
