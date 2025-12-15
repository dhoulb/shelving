import { rm } from "node:fs/promises";
import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMarkup } from "../markup/render.js";
import { MARKUP_RULES } from "../markup/rule/index.js";
import { getSlug } from "../util/string.js";
import { Layout } from "./components/Layout.js";
import { SymbolCard } from "./components/SymbolCard.js";
import { writeFileEnsured } from "./util/fs.js";
import type { PathNode } from "./util/nodes.js";
import { relativeHref, resolveOutputPath, stripExtension } from "./util/paths.js";
import { PALETTE } from "./util/style.js";

export async function writeDocs(root: PathNode, outputRoot: string): Promise<void> {
	await rm(outputRoot, { recursive: true, force: true });
	await writeDirPage(root, root, outputRoot);
}

async function writeDirPage(node: PathNode, root: PathNode, outputRoot: string): Promise<void> {
	if (node.kind === "file") {
		const currentPath = stripExtension(node.path);
		const sidebarItems = buildSidebarItems(root, currentPath);
		const html = renderFilePage(node, sidebarItems, currentPath);
		const outPath = resolveOutputPath(outputRoot, currentPath);
		await writeFileEnsured(outPath, html);
		return;
	}
	const currentPath = node.path || "";
	const sidebarItems = buildSidebarItems(root, currentPath);
	const html = renderDirPage(node, sidebarItems, currentPath);
	const outPath = resolveOutputPath(outputRoot, currentPath);
	await writeFileEnsured(outPath, html);
	for (const child of node.children ?? []) {
		if (child.kind === "directory" || child.kind === "file") {
			await writeDirPage(child, root, outputRoot);
		}
	}
}

function buildSidebarItems(tree: PathNode, fromPath: string): SidebarItem[] {
	const dirChildren = tree.children?.filter(c => c.kind === "directory") ?? [];
	return [
		{ label: "home", href: relativeHref(fromPath, ""), path: "" },
		...dirChildren.map(dir => ({
			label: dir.name,
			path: dir.path,
			href: relativeHref(fromPath, dir.path),
			children: dir.children
				?.filter((c): c is PathNode => c.kind === "file")
				.map(file => {
					const targetPath = stripExtension(file.path);
					const fileHref = relativeHref(fromPath, targetPath);
					return {
						label: file.name,
						path: targetPath,
						href: fileHref,
						tokens: (file.symbols ?? []).map(token => {
							const base = targetPath === fromPath ? "" : fileHref;
							const anchor = `#${getSlug(token.name)}`;
							return {
								label: token.name,
								path: `${targetPath}${anchor}`,
								href: base ? `${base}${anchor}` : anchor,
							};
						}),
					};
				}),
		})),
	];
}

function renderDirPage(dir: PathNode, sidebarItems: SidebarItem[], currentPath: string): string {
	const body = (
		<Layout title={dir.name || "home"} sidebarItems={sidebarItems} currentPath={currentPath}>
			<div style={{ color: PALETTE.muted, lineHeight: 1.7, fontSize: "15px" }}>
				{dir.description ? renderMarkupToHtml(dir.description) : "No description yet."}
			</div>
		</Layout>
	);
	return wrapHtml(renderToStaticMarkup(body));
}

function renderFilePage(file: PathNode, sidebarItems: SidebarItem[], currentPath: string): string {
	const symbols = (file.symbols ?? []).map(s => <SymbolCard key={s.name} {...s} />);
	const body = (
		<Layout title={file.name} sidebarItems={sidebarItems} currentPath={currentPath}>
			<div>
				{file.description ? (
					<div style={{ marginBottom: "18px", color: PALETTE.muted, lineHeight: 1.7, fontSize: "15px" }}>
						{renderMarkupToHtml(file.description)}
					</div>
				) : null}
				{symbols}
			</div>
		</Layout>
	);
	return wrapHtml(renderToStaticMarkup(body));
}

function renderMarkupToHtml(markdown: string): ReactElement {
	const node = renderMarkup(markdown, { rules: MARKUP_RULES });
	return <>{node as ReactNode}</>;
}

function wrapHtml(body: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Shelving docs</title>
	<style>
		* { box-sizing: border-box; }
		a { color: ${PALETTE.blue}; }
		code { font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
		::selection { background: ${PALETTE.blue}; color: ${PALETTE.white}; }
	</style>
</head>
<body style="margin:0;background:${PALETTE.background};">
${body}
</body>
</html>`;
}

interface SidebarItem {
	readonly label: string;
	readonly href: string;
	readonly path: string;
	readonly children?: readonly SidebarItem[];
	readonly tokens?: readonly SidebarItem[];
}
