import { type ReactNode, useEffect, useState } from "react";
import { Block } from "../block/Block.js";
import { Panel } from "../block/Panel.js";
import { Row } from "../block/Row.js";
import { Header, Section } from "../block/Section.js";
import { Title } from "../block/Title.js";
import { Button } from "../button/Button.js";
import { TextareaInput } from "../input/TextareaInput.js";
import { Page } from "../page/Page.js";
import { notifyError, notifySuccess } from "../util/notice.js";
import { DocumentationFrame } from "./DocumentationFrame.js";
import { DocumentationPlaygroundVariables } from "./DocumentationPlaygroundVariables.js";
import { formatPlaygroundHash, parsePlaygroundHash } from "./playground.js";

/** Title shown for the playground page. */
const TITLE = "Playground";

/** Code shown when the URL has no code. */
const DEFAULT_CODE = `import { useState } from "react";
import { Button, Card, Details, Heading, Notice, Paragraph, Row, Tag } from "shelving/ui";

function Example() {
  const [count, setCount] = useState(0);
  return (
    <Card>
      <Heading>Hello, playground</Heading>
      <Paragraph>Edit the TSX or the CSS. The preview updates as you type.</Paragraph>
      <Row left>
        <Button solid color="primary" onClick={() => setCount(count + 1)}>Clicked {count} times</Button>
        <Button outline onClick={() => setCount(0)}>Reset</Button>
        <Tag status="success">New</Tag>
      </Row>
      <Notice status="warning">Code can import from shelving, react, and react-dom only.</Notice>
      <Details title="What can I change?">
        <Paragraph>Open the Variables tab to see every CSS variable that shelving reads.</Paragraph>
      </Details>
    </Card>
  );
}

<Example />
`;

/** CSS shown when the URL has no CSS. */
const DEFAULT_CSS = `/* Change any shelving variable here. Open the Variables tab for the full list. */
:root {
  --color-primary: var(--color-purple);
  --color-gray: oklch(60% 0.04 300deg);
  --radius-normal: 6px;
}
`;

/** Time to wait after the last key press before the preview runs again. */
const DELAY = 400;

/** Tabs of the editor. */
type Tab = "code" | "css" | "variables";

/**
 * Page where you can write TSX and CSS and see the result run live, like the TypeScript Playground.
 * - The TSX tab holds code that can import from `shelving/*`, `react`, and `react-dom`. Its top-level expressions are shown in the preview.
 * - The CSS tab holds CSS that is added after the shelving styles, so you can change any shelving variable.
 * - The Variables tab lists every CSS variable that shelving components read, grouped by the module that owns it, ready to add to the CSS.
 * - The code and CSS are kept in the URL hash, so you can share a link to what you made.
 * - The preview is a `<DocumentationFrame>`, so it uses the raw shelving styles and not the docs site styles.
 *
 * @kind component
 * @example <Router routes={{ "/playground": DocumentationPlaygroundPage }} />
 * @see https://shelving.cc/ui/DocumentationPlaygroundPage
 */
export function DocumentationPlaygroundPage(): ReactNode {
	const [tab, setTab] = useState<Tab>("code");
	const [code, setCode] = useState(DEFAULT_CODE);
	const [css, setCss] = useState(DEFAULT_CSS);
	const [preview, setPreview] = useState({ code: DEFAULT_CODE, css: DEFAULT_CSS });

	// Read the code and CSS from the URL hash (only in the browser, after the first render).
	useEffect(() => {
		const hashed = parsePlaygroundHash(window.location.hash);
		if (!hashed.code && !hashed.css) return;
		const next = { code: hashed.code ?? "", css: hashed.css ?? "" };
		setCode(next.code);
		setCss(next.css);
		setPreview(next);
	}, []);

	// Run the preview, and save the code and CSS in the URL hash, a short time after the last change.
	useEffect(() => {
		const timer = setTimeout(() => {
			setPreview({ code, css });
			const url = new URL(window.location.href);
			url.hash = formatPlaygroundHash({ code, css });
			window.history.replaceState(window.history.state, "", url.href);
		}, DELAY);
		return () => clearTimeout(timer);
	}, [code, css]);

	return (
		<Page title={TITLE}>
			<Panel>
				<Header>
					<Title center>{TITLE}</Title>
				</Header>
			</Panel>
			<Block indent="normal" padding="section">
				<Section>
					<Row left wrap>
						<Button selected={tab === "code"} onClick={() => setTab("code")}>
							TSX
						</Button>
						<Button selected={tab === "css"} onClick={() => setTab("css")}>
							CSS
						</Button>
						<Button selected={tab === "variables"} onClick={() => setTab("variables")}>
							Variables
						</Button>
						<Button
							outline
							onClick={() => {
								navigator.clipboard.writeText(window.location.href).then(
									() => notifySuccess("Link copied"),
									() => notifyError("Could not copy the link"),
								);
							}}
						>
							Copy link
						</Button>
						<Button
							plain
							onClick={() => {
								setCode(DEFAULT_CODE);
								setCss(DEFAULT_CSS);
							}}
						>
							Reset
						</Button>
					</Row>
					{tab === "code" && <TextareaInput name="code" title="TSX" font="code" rows={16} value={code} onValue={v => setCode(v ?? "")} />}
					{tab === "css" && <TextareaInput name="css" title="CSS" font="code" rows={16} value={css} onValue={v => setCss(v ?? "")} />}
					{tab === "variables" && (
						<DocumentationPlaygroundVariables
							onAdd={added => {
								setCss(css.trim() ? `${css.trimEnd()}\n\n${added}` : added);
								setTab("css");
							}}
						/>
					)}
				</Section>
				<Section>
					<DocumentationFrame code={preview.code} css={preview.css} title="Playground preview" />
				</Section>
			</Block>
		</Page>
	);
}
