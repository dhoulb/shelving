import { type PointerEvent, type ReactNode, type SyntheticEvent, startTransition, useEffect, useRef, useState } from "react";
import { AddIcon } from "../../icon/AddIcon.js";
import { LeftIcon } from "../../icon/LeftIcon.js";
import { Row } from "../block/Row.js";
import { Button } from "../button/Button.js";
import { TextareaInput } from "../input/TextareaInput.js";
import { Page } from "../page/Page.js";
import { getClass, getModuleClass } from "../util/css.js";
import { DocumentationFrame } from "./DocumentationFrame.js";
import { DocumentationPlaygroundInsert } from "./DocumentationPlaygroundInsert.js";
import DOCUMENTATION_PLAYGROUND_PAGE_CSS from "./DocumentationPlaygroundPage.module.css";
import { formatPlaygroundHash, insertPlaygroundSnippet, insertPlaygroundText, parsePlaygroundHash } from "./playground.js";

const PLAYGROUND_CLASS = getModuleClass(DOCUMENTATION_PLAYGROUND_PAGE_CSS, "playground");
const EDITOR_CLASS = getModuleClass(DOCUMENTATION_PLAYGROUND_PAGE_CSS, "editor");
const PREVIEW_CLASS = getModuleClass(DOCUMENTATION_PLAYGROUND_PAGE_CSS, "preview");
const HANDLE_CLASS = getModuleClass(DOCUMENTATION_PLAYGROUND_PAGE_CSS, "handle");
const DRAGGING_CLASS = getModuleClass(DOCUMENTATION_PLAYGROUND_PAGE_CSS, "dragging");

/** Title shown for the playground page. */
const TITLE = "Playground";

/** Code shown when the URL has no code. */
const DEFAULT_CODE = `import { useState } from "react";
import { DATA, EMAIL, BOOLEAN, StringSchema } from "shelving/schema";
import {
  Block, Button, Card, Definitions, Details, Form, Grid, Heading, Notice,
  Panel, Paragraph, Row, Subheading, Table, Tag, Title,
} from "shelving/ui";

const SIGNUP = DATA({
  name: new StringSchema({ title: "Name", min: 1, max: 60 }),
  email: EMAIL,
  updates: BOOLEAN,
});

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Row left>
      <Button solid onClick={() => setCount(count + 1)}>Liked {count} times</Button>
      <Button outline onClick={() => setCount(0)}>Reset</Button>
    </Row>
  );
}

<Panel color="primary" padding="large">
  <Block width="narrow">
    <Title>Shelving playground</Title>
    <Paragraph>Edit the TSX or the CSS on the left. The preview updates as you type.</Paragraph>
    <Counter />
  </Block>
</Panel>

<Panel padding="large">
  <Block width="narrow">
    <Heading>Projects</Heading>
    <Grid gap="small">
      <Card shadow="small">
        <Subheading>Trail log</Subheading>
        <Paragraph>Record runs and rides offline, then sync.</Paragraph>
        <Tag status="success">Live</Tag>
      </Card>
      <Card shadow="small">
        <Subheading>Recipe box</Subheading>
        <Paragraph>Shared shopping lists for the whole house.</Paragraph>
        <Tag status="warning">Beta</Tag>
      </Card>
      <Card shadow="small">
        <Subheading>Tide tables</Subheading>
        <Paragraph>Local tide times, with alerts for low water.</Paragraph>
        <Tag>Draft</Tag>
      </Card>
    </Grid>
  </Block>
</Panel>

<Panel color="primary" padding="large">
  <Block width="narrow">
    <Heading>Team</Heading>
    <Table>
      <thead>
        <tr><th>Name</th><th>Role</th><th>Plan</th></tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>Owner</td><td>Pro</td></tr>
        <tr><td>Bob</td><td>Editor</td><td>Free</td></tr>
        <tr><td>Chloe</td><td>Viewer</td><td>Free</td></tr>
      </tbody>
    </Table>
    <Definitions>
      <dt>Created</dt><dd>3 March 2026</dd>
      <dt>Storage</dt><dd>2.4 GB of 10 GB</dd>
    </Definitions>
    <Notice status="warning">Code can import from shelving, react, and react-dom only.</Notice>
  </Block>
</Panel>

<Panel padding="large">
  <Block width="narrow">
    <Heading>Join the beta</Heading>
    <Card shadow="small">
      <Form schema={SIGNUP} submit="Sign up" onSubmit={data => \`Thanks, \${data.name}!\`} />
    </Card>
    <Details title="What can I change?">
      <Paragraph>Press + above the code to add a component, or a variable to the CSS.</Paragraph>
    </Details>
  </Block>
</Panel>
`;

/** CSS shown when the URL has no CSS. */
const DEFAULT_CSS = `/* Change any shelving variable here. Press + to add more. */
:root {
  --color-primary: var(--color-purple);
  --color-gray: oklch(60% 0.04 300deg);
}
`;

/** Width of the editor at first, and the smallest and largest width you can drag it to, as a percent of the page. */
const SPLIT = 40;
const MIN_SPLIT = 20;
const MAX_SPLIT = 80;

/** Time to wait after the last key press before the preview runs again. */
const DELAY = 400;

/** Tabs of the editor. */
type Tab = "code" | "css";

/**
 * Page where you can write TSX and CSS and see the result run live, like the TypeScript Playground.
 * - It fills the whole window: the editor is on the left, in a grey panel, and the preview fills the right.
 * - Drag the edge between them (or focus it and press the arrow keys) to change their widths.
 * - The TSX tab holds code that can import from `shelving/*`, `react`, and `react-dom`. Its top-level expressions are shown in the preview.
 * - The CSS tab holds CSS that is added after the shelving styles, so you can change any shelving variable.
 * - The + button opens a `<DocumentationPlaygroundInsert>` panel. On the TSX tab it lists the shelving components, and on the CSS tab the CSS variables. Press one to insert it at the cursor.
 * - The code and CSS are saved in the URL hash on every change, so the address is always a link to what you made.
 * - The preview is a `<DocumentationFrame>`, so it uses the raw shelving styles and not the docs site styles.
 * - It has no sidebar of its own. `<DocumentationApp>` renders it outside its `<SidebarLayout>`.
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
	// The text boxes are uncontrolled, so a new `loaded` count remounts them when the code or CSS changes from outside.
	const [loaded, setLoaded] = useState(0);
	const [split, setSplit] = useState(SPLIT);
	const [dragging, setDragging] = useState(false);
	const [inserting, setInserting] = useState<{ at: number | undefined } | undefined>(undefined);
	const ref = useRef<HTMLDivElement>(null);
	// The last cursor position in the text box, so Insert can put text there after the text box loses focus.
	const cursor = useRef<number | undefined>(undefined);
	const onCursor = (e: SyntheticEvent) => {
		if (e.target instanceof HTMLTextAreaElement) cursor.current = e.target.selectionStart;
	};

	// Read the code and CSS from the URL hash (only in the browser, after the first render).
	useEffect(() => {
		const hashed = parsePlaygroundHash(window.location.hash);
		if (!hashed.code && !hashed.css) return;
		const next = { code: hashed.code ?? "", css: hashed.css ?? "" };
		setCode(next.code);
		setCss(next.css);
		setPreview(next);
		setLoaded(n => n + 1);
	}, []);

	// Save the code and CSS in the URL hash on every change, so the address is always a link to what you made.
	useEffect(() => {
		const url = new URL(window.location.href);
		// The default code and CSS need no hash, so a fresh playground keeps a short address.
		url.hash = code === DEFAULT_CODE && css === DEFAULT_CSS ? "" : formatPlaygroundHash({ code, css });
		if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url.href);
	}, [code, css]);

	// Run the preview a short time after the last change.
	useEffect(() => {
		const timer = setTimeout(() => setPreview({ code, css }), DELAY);
		return () => clearTimeout(timer);
	}, [code, css]);

	// Set the width of the editor as a CSS variable, so the grid and the handle both follow it.
	useEffect(() => {
		ref.current?.style.setProperty("--documentation-playground-split", `${split}%`);
	}, [split]);

	// Move the edge to the pointer while dragging.
	const onPointerMove = (e: PointerEvent<HTMLHRElement>) => {
		const rect = ref.current?.getBoundingClientRect();
		if (!dragging || !rect?.width) return;
		setSplit(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, ((e.clientX - rect.left) / rect.width) * 100)));
	};

	return (
		<Page title={TITLE}>
			<div ref={ref} className={PLAYGROUND_CLASS}>
				<div className={EDITOR_CLASS} onSelect={onCursor}>
					<Row between>
						<Button small href="/" title="Home">
							<LeftIcon />
						</Button>
						<Row center gap="xsmall">
							<Button
								small
								selected={tab === "code"}
								onClick={() => {
									setTab("code");
									cursor.current = undefined;
								}}
							>
								TSX
							</Button>
							<Button
								small
								selected={tab === "css"}
								onClick={() => {
									setTab("css");
									cursor.current = undefined;
								}}
							>
								CSS
							</Button>
						</Row>
						<Button
							small
							title={tab === "code" ? "Insert a component" : "Insert a variable"}
							onClick={() => startTransition(() => setInserting({ at: cursor.current }))}
						>
							<AddIcon />
						</Button>
					</Row>
					{tab === "code" && (
						<TextareaInput
							key={`code-${loaded}`}
							name="code"
							title="TSX"
							font="code"
							rows={16}
							value={code}
							onValue={v => setCode(v ?? "")}
						/>
					)}
					{tab === "css" && (
						<TextareaInput key={`css-${loaded}`} name="css" title="CSS" font="code" rows={16} value={css} onValue={v => setCss(v ?? "")} />
					)}
					{inserting && (
						<DocumentationPlaygroundInsert
							type={tab}
							onClose={() => startTransition(() => setInserting(undefined))}
							onInsert={text => {
								if (tab === "code") setCode(insertPlaygroundSnippet(code, text, inserting.at));
								else setCss(insertPlaygroundText(css, text, inserting.at));
								setLoaded(n => n + 1);
								cursor.current = undefined;
							}}
						/>
					)}
				</div>
				<hr
					className={getClass(HANDLE_CLASS, dragging && DRAGGING_CLASS)}
					aria-orientation="vertical"
					aria-label="Resize the editor"
					aria-valuenow={Math.round(split)}
					aria-valuemin={MIN_SPLIT}
					aria-valuemax={MAX_SPLIT}
					tabIndex={0}
					onPointerDown={e => {
						e.currentTarget.setPointerCapture(e.pointerId);
						setDragging(true);
					}}
					onPointerMove={onPointerMove}
					onPointerUp={() => setDragging(false)}
					onPointerCancel={() => setDragging(false)}
					onKeyDown={e => {
						const step = e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : 0;
						if (step) setSplit(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, split + step)));
					}}
				/>
				<DocumentationFrame className={PREVIEW_CLASS} code={preview.code} css={preview.css} title="Playground preview" />
			</div>
		</Page>
	);
}
