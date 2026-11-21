import type { ReactElement } from "react";
import type { MarkupRule, MarkupRules } from "../../markup/MarkupRule.js";
import { createMarkupRule } from "../../markup/MarkupRule.js";
import { createFencedRegExp, parseFencedInfo } from "../../markup/rule/fenced.js";
import { TREE_MARKUP_RULES } from "../tree/TreeMarkup.js";
import { getClass, getModuleClass } from "../util/css.js";
import { DocumentationFrame } from "./DocumentationFrame.js";
import DOCUMENTATION_LIVE_CSS from "./DocumentationLive.module.css";
import { formatPlaygroundHash, PLAYGROUND_PAGE_PATH } from "./playground.js";

const LIVE_CLASS = getModuleClass(DOCUMENTATION_LIVE_CSS, "live");
const DEVICE_CLASS = getModuleClass(DOCUMENTATION_LIVE_CSS, "device");
const PHONE_CLASS = getModuleClass(DOCUMENTATION_LIVE_CSS, "phone");
const DESKTOP_CLASS = getModuleClass(DOCUMENTATION_LIVE_CSS, "desktop");
const BROWSER_CLASS = getModuleClass(DOCUMENTATION_LIVE_CSS, "browser");
const SCREEN_CLASS = getModuleClass(DOCUMENTATION_LIVE_CSS, "screen");
const LINK_CLASS = getModuleClass(DOCUMENTATION_LIVE_CSS, "link");

/**
 * Props for `<DocumentationLive>` — the code to show and run, plus an optional title.
 *
 * @see https://shelving.cc/ui/DocumentationLiveProps
 */
export interface DocumentationLiveProps {
	/** TSX source to show and run. It can import from `shelving/*`, `react`, and `react-dom` only. */
	code: string;
	/** Title of the example, used as the accessible title of the preview frame. */
	title?: string | undefined;
	/** Show the preview in a full-width browser window under the code, not on a phone. Use it for a wide preview, such as a sidebar layout or a big table. */
	desktop?: boolean | undefined;
}

/**
 * Show a code example next to a live preview of it on a simple phone, with a link under it that opens it in the playground.
 * - The preview is a `<DocumentationFrame>`, so it runs in the browser with the raw shelving styles.
 * - The phone is light grey, so it suggests a device without competing with the preview. Its screen is square and has a fixed height, and it scrolls when the preview is taller.
 * - The code and preview are side by side on a wide screen, and stacked on a narrow one.
 * - With `desktop`, the preview is in a full-width browser window under the code, with a taller screen.
 *
 * @kind component
 * @see https://shelving.cc/ui/DocumentationLive
 */
export function DocumentationLive({ code, title, desktop = false }: DocumentationLiveProps): ReactElement {
	return (
		<figure className={getClass(LIVE_CLASS, desktop && DESKTOP_CLASS)}>
			<pre>
				<code>{code}</code>
			</pre>
			<div className={DEVICE_CLASS}>
				<div className={desktop ? BROWSER_CLASS : PHONE_CLASS}>
					<DocumentationFrame className={SCREEN_CLASS} code={code} title={title || "Live example"} />
				</div>
				<a className={LINK_CLASS} href={`${PLAYGROUND_PAGE_PATH}${formatPlaygroundHash({ code })}`}>
					Open in playground →
				</a>
			</div>
		</figure>
	);
}

/**
 * Markup rule that renders a fenced code block with a `live` flag as a `<DocumentationLive>` example, e.g. ` ```tsx live "Card with a link" `.
 * - The `live` flag must come before any quoted title (see `parseFencedInfo()` for the info string format).
 * - Add a `desktop` flag to show the preview in a full-width browser window, e.g. ` ```tsx live desktop "Sidebar layout" `.
 * - Has the same priority as `FENCED_RULE`, so a `live` block inside a longer fence stays code. List it before `FENCED_RULE`, so it takes the `live` blocks and leaves every other block to `FENCED_RULE`.
 *
 * @see https://shelving.cc/ui/DOCUMENTATION_LIVE_RULE
 */
export const DOCUMENTATION_LIVE_RULE: MarkupRule = createMarkupRule(
	createFencedRegExp('[^\\n"]*?(?<![\\w.-])live(?![\\w.-])[^\\n]*?'),
	(key, { info = "", code }) => {
		const { flags, title } = parseFencedInfo(info);
		return <DocumentationLive key={key} code={code.trim()} title={title} desktop={flags.includes("desktop")} />;
	},
	["block", "list"],
	10, // Same priority as `FENCED_RULE`, which it must come before in a rule list.
);

/**
 * Markup rules for docs site content: `DOCUMENTATION_LIVE_RULE` then `TREE_MARKUP_RULES`, so fenced code blocks with a `live` flag run.
 *
 * @see https://shelving.cc/ui/DOCUMENTATION_MARKUP_RULES
 */
export const DOCUMENTATION_MARKUP_RULES: MarkupRules = [DOCUMENTATION_LIVE_RULE, ...TREE_MARKUP_RULES];
