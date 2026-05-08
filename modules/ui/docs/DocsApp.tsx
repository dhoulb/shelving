import { posix } from "node:path";
import type { ReactElement, ReactNode } from "react";
import { renderMarkup } from "../../markup/render.js";
import { MARKUP_RULES } from "../../markup/rule/index.js";
import type { DocsExtra, DocsNode, DocsTokens } from "../../util/docs.js";
import type { JSXNode } from "../../util/jsx.js";
import { getSlug } from "../../util/string.js";
import { SidebarLayout } from "../layout/SidebarLayout.js";
import { requireMeta } from "../misc/Meta.js";
import { HTMLPage } from "../page/Page.js";
import styles from "./DocsApp.module.css";
import { DocsSidebar, type DocsSidebarItem } from "./DocsSidebar.js";
import { DocsStorybook } from "./DocsStorybook.js";
import { DocsSymbolCard } from "./DocsSymbolCard.js";

const STYLESHEET_NAME = "style.css";

export interface DocsAppProps {
	readonly tokens: DocsTokens;
}

/**
 * Top-level docs site component. Takes a `DocsTokens` snapshot and renders the page for the current `<Meta url>`.
 * - Reads the current URL from `requireMeta()` (set by `renderRoute()` / `<Meta url>`).
 * - Walks `tokens.root` to find the matching node, or routes to a `tokens.extras` slot like `"storybook"`.
 * - Wraps everything in `<HTMLPage>` so the rendered output is a complete HTML document.
 */
export function DocsApp({ tokens }: DocsAppProps): ReactElement {
	const { url } = requireMeta();
	const path = url ? url.pathname.replace(/^\/|\/$/g, "") : "";
	const matchedNode = _findNode(tokens.root, path);
	const matchedExtra = tokens.extras.find(e => e.path === path);
	const sidebarItems = _buildSidebarItems(tokens, path);
	const stylesheet = _relativeHref(path, STYLESHEET_NAME);
	const title = matchedExtra?.title ?? matchedNode?.name ?? "home";
	const lede = matchedExtra?.lede;

	return (
		<HTMLPage app={tokens.title} title={title} language="en" links={{ stylesheet }}>
			<SidebarLayout sidebar={<DocsSidebar title={tokens.title} items={sidebarItems} currentPath={path} />}>
				<header className={styles.header}>
					<h1 className={styles.title}>{title}</h1>
					{lede ? <p className={styles.lede}>{lede}</p> : null}
				</header>
				{matchedExtra ? _renderExtra(matchedExtra) : matchedNode ? _renderNode(matchedNode) : null}
			</SidebarLayout>
		</HTMLPage>
	);
}

function _renderExtra(extra: DocsExtra): ReactNode {
	if (extra.slot === "storybook") return <DocsStorybook />;
	return null;
}

function _renderNode(node: DocsNode): ReactNode {
	if (node.kind === "directory") {
		return node.description ? <div>{_renderMarkdown(node.description)}</div> : <p>No description yet.</p>;
	}
	return (
		<div>
			{node.description ? <div>{_renderMarkdown(node.description)}</div> : null}
			{(node.symbols ?? []).map(symbol => (
				<DocsSymbolCard key={symbol.name} {...symbol} renderMarkdown={_renderMarkdown} />
			))}
		</div>
	);
}

function _renderMarkdown(markdown: string): JSXNode {
	return renderMarkup(markdown, { rules: MARKUP_RULES });
}

// ──────────────────────────────────────────────────────────────────────────────
// Tree lookup
// ──────────────────────────────────────────────────────────────────────────────

function _findNode(root: DocsNode, path: string): DocsNode | undefined {
	if (!path) return root;
	const segments = path.split("/");
	let node: DocsNode | undefined = root;
	for (const segment of segments) {
		const next: DocsNode | undefined = node?.children?.find(c => (c.kind === "directory" ? c.name : _stripExtension(c.name)) === segment);
		if (!next) return undefined;
		node = next;
	}
	return node;
}

// ──────────────────────────────────────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────────────────────────────────────

function _buildSidebarItems(tokens: DocsTokens, currentPath: string): readonly DocsSidebarItem[] {
	const home: DocsSidebarItem = { label: "home", path: "", href: _relativeHref(currentPath, "") };
	const extras: DocsSidebarItem[] = tokens.extras.map(extra => ({
		label: extra.title,
		path: extra.path,
		href: _relativeHref(currentPath, extra.path),
	}));
	const dirs: DocsSidebarItem[] = (tokens.root.children ?? []).filter(c => c.kind === "directory").map(dir => _dirToItem(dir, currentPath));
	return [home, ...extras, ...dirs];
}

function _dirToItem(dir: DocsNode, currentPath: string): DocsSidebarItem {
	const subdirs = (dir.children ?? []).filter(c => c.kind === "directory").map(sub => _dirToItem(sub, currentPath));
	const files = (dir.children ?? []).filter(c => c.kind === "file").map(file => _fileToItem(file, currentPath));
	return {
		label: dir.name,
		path: dir.path,
		href: _relativeHref(currentPath, dir.path),
		children: [...files, ...subdirs],
	};
}

function _fileToItem(file: DocsNode, currentPath: string): DocsSidebarItem {
	const targetPath = _stripExtension(file.path);
	const targetHref = _relativeHref(currentPath, targetPath);
	const tokens: DocsSidebarItem[] = (file.symbols ?? []).map(symbol => {
		const slug = getSlug(symbol.name) ?? "";
		const tokenPath = `${targetPath}#${slug}`;
		const tokenHref = currentPath === targetPath ? `#${slug}` : `${targetHref}#${slug}`;
		return { label: symbol.name, path: tokenPath, href: tokenHref };
	});
	return { label: file.name, path: targetPath, href: targetHref, tokens };
}

// ──────────────────────────────────────────────────────────────────────────────
// Path / href helpers
// ──────────────────────────────────────────────────────────────────────────────

function _stripExtension(path: string): string {
	const parsed = posix.parse(path);
	return posix.join(parsed.dir, parsed.name);
}

function _relativeHref(fromPath: string, toPath: string): string {
	const fromDir = fromPath || ".";
	const rel = posix.relative(fromDir, toPath || ".");
	if (rel === "") return "./";
	if (rel.endsWith("/")) return rel;
	// File refs (those with a real `.ext` suffix) stay as-is; directory refs get a trailing slash.
	const lastSegment = rel.slice(rel.lastIndexOf("/") + 1);
	return /\.[a-z0-9]+$/i.test(lastSegment) ? rel : `${rel}/`;
}
