import { type ReactElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Block } from "../modules/ui/block/Block.js";
import { Card } from "../modules/ui/block/Card.js";
import { Heading } from "../modules/ui/block/Heading.js";
import { Panel } from "../modules/ui/block/Panel.js";
import { Paragraph } from "../modules/ui/block/Paragraph.js";
import { Title } from "../modules/ui/block/Title.js";
import { Button } from "../modules/ui/form/Button.js";
import { Code } from "../modules/ui/inline/Code.js";
import { Notice } from "../modules/ui/notice/Notice.js";

// Load base design tokens, layer order, and body baseline typography for side effect.
import "../modules/ui/style/base.css";

// Theme file that sets per-component hooks (e.g. `--card-color-light`, `--button-color-dark`).
// Plain CSS — token overrides at `:root` propagate via inheritance, no layer participation needed.
import "./theme.css";

/** A swatch row showing all 5 scale steps at the current scope (variant or default). */
function Scale({ label }: { label: string }): ReactElement {
	return (
		<div style={{ display: "flex", gap: 8, alignItems: "center", marginBlock: 8 }}>
			<div style={{ width: 80, fontSize: 12, color: "var(--color-dark)" }}>{label}</div>
			{(["black", "dark", "vivid", "light", "white"] as const).map(step => (
				<div
					key={step}
					title={step}
					style={{
						background: `var(--color-${step})`,
						width: 48,
						height: 32,
						borderRadius: 4,
						border: "1px solid var(--color-vivid)",
					}}
				/>
			))}
		</div>
	);
}

function Page(): ReactElement {
	return (
		<Block narrow>
			<Title>Issue #125 — stress test</Title>
			<Paragraph>
				Every scenario below should render <em>correctly</em>: per-component theme hooks paint the default, variant classes (
				<Code>status="success"</Code>, <Code>red</Code>, <Code>primary</Code>) override the inner three steps of the 5-step scale at their
				scope.
			</Paragraph>

			<Heading>0a. The 5-step scale</Heading>
			<Paragraph>
				Each row shows the active <Code>--color-black</Code>, <Code>--color-dark</Code>, <Code>--color-vivid</Code>,{" "}
				<Code>--color-light</Code>, and <Code>--color-white</Code> tokens for that scope. The middle three change per variant; the extremes
				stay put.
			</Paragraph>
			<Scale label="default" />
			<div className="red">
				<Scale label="red" />
			</div>
			<div className="orange">
				<Scale label="orange" />
			</div>
			<div className="yellow">
				<Scale label="yellow" />
			</div>
			<div className="green">
				<Scale label="green" />
			</div>
			<div className="aqua">
				<Scale label="aqua" />
			</div>
			<div className="blue">
				<Scale label="blue" />
			</div>
			<div className="purple">
				<Scale label="purple" />
			</div>
			<div className="pink">
				<Scale label="pink" />
			</div>

			<Heading>0b. Coloured buttons</Heading>
			<Button red>Red button</Button>
			<Button orange>Orange button</Button>
			<Button yellow>Yellow button</Button>
			<Button green>Green button</Button>
			<Button aqua>Aqua button</Button>
			<Button blue>Blue button</Button>
			<Button purple>Purple button</Button>
			<Button pink>Pink button</Button>

			<Heading>0c. Strong (vivid) buttons</Heading>
			<Paragraph>
				<Code>.strong</Code> swaps the step pair from <Code>bg=light + text=dark</Code> to <Code>bg=vivid + text=white</Code>.
			</Paragraph>
			<Button strong red>
				Strong red
			</Button>
			<Button strong success>
				Strong success
			</Button>
			<Button strong primary>
				Strong primary
			</Button>

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
				<Notice status="info">Plain info notice inside plain card.</Notice>
				<Notice status="success">Success notice inside plain card (should be green).</Notice>
				<Notice status="error">Error notice inside plain card (should be red).</Notice>
			</Card>
			<Card status="error">
				<Notice status="warning">Warning notice inside error card — should be its own warning colour.</Notice>
			</Card>

			<Heading>3. Code chips inside cards</Heading>
			<Card>
				<Paragraph>
					Plain card with <Code>code chip</Code> — chip uses its own light/dark pair (currently grey, theme overrides only Card).
				</Paragraph>
			</Card>
			<Card status="success">
				<Paragraph>
					Success card with <Code>code chip</Code> — chip should still use its own grey, not inherit success green.
				</Paragraph>
			</Card>

			<Heading>4. Buttons in variant cards</Heading>
			<Card status="error">
				<Paragraph>Error card containing buttons:</Paragraph>
				<Button success>Success button — should be GREEN (variant beats theme).</Button>
				<Button primary>Primary button — should be BLUE.</Button>
			</Card>

			<Heading>5. Custom ancestor that sets --color-light</Heading>
			<div style={{ "--color-light": "mistyrose", padding: "1rem", border: "2px dashed mistyrose" }}>
				<Paragraph>This wrapping div sets --color-light = mistyrose on its scope.</Paragraph>
				<Card>
					<Paragraph>Card — its theme hook (peach) wins over the ancestor's --color-light.</Paragraph>
				</Card>
				<Button>Button — its theme hook (lavender) wins over the ancestor's --color-light.</Button>
				<Paragraph>
					Inline <Code>code chip</Code> — no theme hook; should pick up the ancestor's mistyrose.
				</Paragraph>
			</div>

			<Heading>6. Custom ancestor with theme hooks reset</Heading>
			<div
				style={{
					"--color-light": "mistyrose",
					"--card-color-light": "initial",
					padding: "1rem",
					border: "2px dashed mistyrose",
				}}
			>
				<Paragraph>Same div, but `--card-color-light` is reset (as if no theme).</Paragraph>
				<Card>
					<Paragraph>Card — should now inherit mistyrose from the wrapper (no hook, inherit fallback kicks in).</Paragraph>
				</Card>
			</div>

			<Heading>7. Panel — full-width vertical regions</Heading>
			<Paragraph>
				<Code>&lt;Panel&gt;</Code> is a full-width section with xxlarge padding and the current light/dark pair.
			</Paragraph>
		</Block>
	);
}

function FullWidthPanels(): ReactElement {
	return (
		<>
			<Panel>
				<Block narrow>
					<Heading>Plain panel</Heading>
					<Paragraph>Default theme surface (grey). Cards inside still get their theme peach.</Paragraph>
					<Card>
						<Paragraph>
							A card inside a plain panel. <Code>code chip</Code> for contrast.
						</Paragraph>
					</Card>
				</Block>
			</Panel>
			<Panel status="success">
				<Block narrow>
					<Heading>Success panel</Heading>
					<Paragraph>Panel with status="success" — pure success green, no muddying.</Paragraph>
				</Block>
			</Panel>
			<Panel as="aside" purple monospace>
				<Block narrow>
					<Heading>Purple monospace aside</Heading>
					<Paragraph>
						Rendered as <Code>&lt;aside&gt;</Code> with <Code>purple</Code> + <Code>monospace</Code> typography variants.
					</Paragraph>
				</Block>
			</Panel>
		</>
	);
}

function App(): ReactElement {
	return (
		<>
			<Page />
			<FullWidthPanels />
		</>
	);
}

const root = document.body.appendChild(document.createElement("div"));
createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
