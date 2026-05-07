import { rm } from "node:fs/promises";
import { posix, resolve as resolvePath } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMarkup } from "../markup/render.js";
import { MARKUP_RULES } from "../markup/rule/index.js";
import type { JSXNode } from "../util/jsx.js";
import { getSlug } from "../util/string.js";
import { Page } from "./components/Page.js";
import type { SidebarItem } from "./components/Sidebar.js";
import { SymbolCard } from "./components/SymbolCard.js";
import { getCollectedCss } from "./util/cssModules.js";
import { writeFileEnsured } from "./util/fs.js";
import type { PathNode, SymbolNode } from "./util/nodes.js";
import { relativeHref, resolveOutputPath, stripExtension } from "./util/paths.js";

/** Output filename for the bundled stylesheet shared by every docs page. */
const STYLESHEET_NAME = "style.css";

/** Top-level title displayed in the header of the sidebar. */
const SIDEBAR_TITLE = "shelving";

/**
 * Render the full docs site for a `PathNode` tree to disk.
 * - Wipes and recreates `outputRoot` first.
 * - Writes one `index.html` per directory and per source file.
 * - Writes a single `style.css` containing all CSS-module styles touched during the render.
 *
 * @param root  Root path node — typically produced by `nestPathNodes(...)`.
 * @param outputRoot  Absolute output directory.
 * @param extras  Optional additional pages to render (e.g. the storybook page).
 */
export async function writeDocs(root: PathNode, outputRoot: string, extras: readonly ExtraPage[] = []): Promise<void> {
	await rm(outputRoot, { recursive: true, force: true });

	// Render pages.
	const sidebarBase = _buildSidebarBase(root, extras);
	await _writeNode(root, outputRoot, sidebarBase);
	for (const extra of extras) await _writeExtra(extra, outputRoot, sidebarBase);

	// Write the single shared stylesheet collected during rendering.
	await writeFileEnsured(resolvePath(outputRoot, STYLESHEET_NAME), getCollectedCss());
}

/** An additional page to render alongside the docs (e.g. a UI library showcase). */
export interface ExtraPage {
	/** Logical path (no extension), e.g. `"storybook"`. */
	readonly path: string;
	/** Page title. */
	readonly title: string;
	/** Optional one-line lede shown under the title. */
	readonly lede?: string;
	/** Body of the page. */
	readonly body: JSXNode;
}

async function _writeNode(node: PathNode, outputRoot: string, sidebarBase: readonly SidebarItem[]): Promise<void> {
	if (node.kind === "file") {
		const currentPath = stripExtension(node.path);
		const html = _renderFile(node, currentPath, sidebarBase);
		await writeFileEnsured(resolveOutputPath(outputRoot, currentPath), html);
		return;
	}
	const currentPath = node.path || "";
	const html = _renderDir(node, currentPath, sidebarBase);
	await writeFileEnsured(resolveOutputPath(outputRoot, currentPath), html);
	for (const child of node.children ?? []) await _writeNode(child, outputRoot, sidebarBase);
}

async function _writeExtra(extra: ExtraPage, outputRoot: string, sidebarBase: readonly SidebarItem[]): Promise<void> {
	const sidebarItems = _resolveSidebarItems(sidebarBase, extra.path);
	const stylesheet = _stylesheetHref(extra.path);
	const html = _renderHtml(
		<Page
			title={extra.title}
			lede={extra.lede}
			stylesheet={stylesheet}
			sidebarTitle={SIDEBAR_TITLE}
			sidebarItems={sidebarItems}
			currentPath={extra.path}
		>
			{extra.body as React.ReactNode}
		</Page>,
	);
	await writeFileEnsured(resolveOutputPath(outputRoot, extra.path), html);
}

function _renderDir(dir: PathNode, currentPath: string, sidebarBase: readonly SidebarItem[]): string {
	const sidebarItems = _resolveSidebarItems(sidebarBase, currentPath);
	const stylesheet = _stylesheetHref(currentPath);
	const description = dir.description;
	return _renderHtml(
		<Page
			title={dir.name || "home"}
			stylesheet={stylesheet}
			sidebarTitle={SIDEBAR_TITLE}
			sidebarItems={sidebarItems}
			currentPath={currentPath}
		>
			{description ? _renderMarkdown(description) : <p>No description yet.</p>}
		</Page>,
	);
}

function _renderFile(file: PathNode, currentPath: string, sidebarBase: readonly SidebarItem[]): string {
	const sidebarItems = _resolveSidebarItems(sidebarBase, currentPath);
	const stylesheet = _stylesheetHref(currentPath);
	return _renderHtml(
		<Page title={file.name} stylesheet={stylesheet} sidebarTitle={SIDEBAR_TITLE} sidebarItems={sidebarItems} currentPath={currentPath}>
			{file.description ? <div>{_renderMarkdown(file.description)}</div> : null}
			{(file.symbols ?? []).map(symbol => (
				<SymbolCard key={symbol.name} {...symbol} renderMarkdown={_renderMarkdown} />
			))}
		</Page>,
	);
}

function _renderMarkdown(markdown: string): JSXNode {
	return renderMarkup(markdown, { rules: MARKUP_RULES });
}

function _renderHtml(node: JSXNode): string {
	return `<!DOCTYPE html>${renderToStaticMarkup(node as React.ReactNode)}`;
}

/** Build the base sidebar items (one entry per directory plus all its files and symbols, recursively), with "extras". */
function _buildSidebarBase(root: PathNode, extras: readonly ExtraPage[]): readonly SidebarItem[] {
	const dirItems = (root.children ?? []).filter(c => c.kind === "directory").map(_dirToSidebarItem);
	const extraItems: SidebarItem[] = extras.map(extra => ({ label: extra.title, path: extra.path, href: "" }));
	return [{ label: "home", path: "", href: "" }, ...extraItems, ...dirItems];
}

function _dirToSidebarItem(dir: PathNode): SidebarItem {
	const subdirs = (dir.children ?? []).filter(c => c.kind === "directory").map(_dirToSidebarItem);
	const files = (dir.children ?? []).filter(c => c.kind === "file").map(_fileToSidebarItem);
	return { label: dir.name, path: dir.path, href: "", children: [...files, ...subdirs] };
}

function _fileToSidebarItem(file: PathNode): SidebarItem {
	const targetPath = stripExtension(file.path);
	const tokens: SidebarItem[] = (file.symbols ?? []).map((token: SymbolNode) => ({
		label: token.name,
		path: `${targetPath}#${getSlug(token.name) ?? ""}`,
		href: "",
	}));
	return { label: file.name, path: targetPath, href: "", tokens };
}

/** Resolve every `href` in a sidebar tree relative to a given current page path. */
function _resolveSidebarItems(base: readonly SidebarItem[], currentPath: string): readonly SidebarItem[] {
	return base.map(item => _resolveItem(item, currentPath));
}

function _resolveItem(item: SidebarItem, currentPath: string): SidebarItem {
	const fragmentIndex = item.path.indexOf("#");
	const targetPath = fragmentIndex >= 0 ? item.path.slice(0, fragmentIndex) : item.path;
	const fragment = fragmentIndex >= 0 ? item.path.slice(fragmentIndex) : "";
	const href = targetPath === currentPath && fragment ? fragment : `${relativeHref(currentPath, targetPath)}${fragment}`;
	return {
		...item,
		href,
		children: item.children?.map(child => _resolveItem(child, currentPath)),
		tokens: item.tokens?.map(token => _resolveItem(token, currentPath)),
	};
}

/** Relative href to the shared stylesheet from a given page's logical path. */
function _stylesheetHref(currentPath: string): string {
	const fromDir = currentPath || ".";
	const rel = posix.relative(fromDir, STYLESHEET_NAME);
	return rel || STYLESHEET_NAME;
}
