/**
 * Shared documentation site configuration, extractors, and rendering.
 *
 * Used by both `build.tsx` (static build) and `start.tsx` (dev server).
 */

import { renderToString } from "react-dom/server";
import { DirectoryExtractor } from "../modules/extract/DirectoryExtractor.js";
import { App } from "../modules/ui/app/App.js";
import { SidebarLayout } from "../modules/ui/layout/SidebarLayout.js";
import { Meta } from "../modules/ui/misc/Meta.js";
import { HTML } from "../modules/ui/page/HTML.js";
import { Page } from "../modules/ui/page/Page.js";
import { TreeCards } from "../modules/ui/tree/TreeCards.js";
import { TreeMenu } from "../modules/ui/tree/TreeMenu.js";
import { TreePage } from "../modules/ui/tree/TreePage.js";
import type { Element } from "../modules/util/element.js";
import { getElementPaths } from "../modules/util/element.js";
import type { AbsolutePath, Path } from "../modules/util/path.js";

// --- Configuration ---

export const SITE_TITLE = "Shelving";
export const SITE_DESCRIPTION = "TypeScript data toolkit";
export const SITE_LANGUAGE = "en";
/** Base URL for the site, from `APP_URL` env var or default to `http://localhost:3456`. */
export const APP_URL = process.env.APP_URL ?? "http://localhost:3456";

/** CSS filename passed from the bootstrap step. */
export const CSS_FILENAME = process.env.DOCS_CSS ?? "index.css";

// --- Extractors ---

/**
 * `DirectoryExtractor` walks the directory tree itself, so the caller only specifies:
 * - `index` — filenames absorbed as directory content (defaults are fine but explicit is clearer).
 * - `ignore` — skip test files (the `.ts` dispatch would otherwise extract them).
 */
// Defaults handle indexing (`README.md` etc.), test-file ignoring, and same-key file merging
// (so `TEMPLATE.md` next to `template.ts` is absorbed into the `template` file element).
const directoryExtractor = new DirectoryExtractor();

/**
 * Extract all module elements from a `modules/` directory.
 * - Walks the directory tree once via `DirectoryExtractor` and unwraps the top-level children.
 * - Returns sorted module elements and the list of all renderable URL paths.
 */
export async function extractModules(modulesDir: Path): Promise<{ elements: Element[]; paths: string[] }> {
	const root = await directoryExtractor.extract(modulesDir);

	// Unwrap the top-level children — each module is a directory.
	// Filter out any file-level children (e.g. `modules/index.ts`) — only directories are modules.
	const elements: Element[] = root.props.children
		? Array.from(root.props.children as Iterable<Element>).filter(el => el.type === "tree-directory")
		: [];

	// Sort top-level modules alphabetically by key.
	elements.sort((a, b) => (a.key ?? "").localeCompare(b.key ?? ""));

	// Collect all renderable paths from the element tree.
	const paths: string[] = ["/"];
	for (const element of elements) {
		const moduleKey = element.key;
		if (!moduleKey) continue;
		paths.push(`/${moduleKey}`);

		if (element.props.children) {
			for (const keyPath of getElementPaths(element.props.children)) {
				paths.push(`/${moduleKey}/${keyPath.join("/")}`);
			}
		}
	}

	return { elements, paths };
}

// --- Rendering ---

/**
 * Render the app for a given URL path and return the full HTML string.
 * - Uses the tree components directly rather than `<TreeApp>`, because `<TreeApp>` wraps in `<Router>`
 *   which uses browser-only hooks (`useInstance`, `useEffect` for `popstate`). SSR doesn't need routing —
 *   we resolve the element at build time.
 * - `TreePage`, `TreeMenu`, and `TreeCards` come pre-configured with default renderers for
 *   `tree-directory`, `tree-file`, and `tree-documentation` (see `modules/ui/docs/`).
 */
export function renderPage(elements: Element[], url: string): string {
	// The root page shows the site overview with cards for each module.
	// All other pages resolve a specific element from the tree using `<TreePage>`.
	const content =
		url === "/" ? (
			<Page title={SITE_TITLE} description={SITE_DESCRIPTION}>
				<TreeCards>{elements}</TreeCards>
			</Page>
		) : (
			<TreePage path={url as AbsolutePath} elements={elements} />
		);

	const appUrl = new URL(url, APP_URL).href;
	const cssPath = `/${CSS_FILENAME}`;

	const html = renderToString(
		<Meta language={SITE_LANGUAGE}>
			<HTML>
				<App title={SITE_TITLE} description={SITE_DESCRIPTION} url={appUrl}>
					<SidebarLayout sidebar={<TreeMenu>{elements}</TreeMenu>}>{content}</SidebarLayout>
				</App>
			</HTML>
		</Meta>,
	);
	// Inject CSS, viewport, and background into <head> — React 19's renderToString doesn't hoist <link> tags.
	const head = [
		`<meta name="viewport" content="width=device-width, initial-scale=1"/>`,
		`<link rel="stylesheet" href="${cssPath}"/>`,
		`<style>body { background: var(--color-bg, white); }</style>`,
	].join("");
	return `<!DOCTYPE html>${html.replace("</head>", `${head}</head>`)}`;
}
