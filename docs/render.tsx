/**
 * Render side of the docs build pipeline.
 *
 * This file is bundled by `Bun.build` (orchestrated from `docs/build.tsx`) so that `.module.css` imports
 * resolve to hashed class-name objects. It renders every page to static HTML and embeds the data the
 * browser needs to hydrate: the per-page meta as JSON (`#docs-data`), plus the client bundle `<script>`.
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { renderToString } from "react-dom/server";
import { createMeta, DocumentationApp, HTML } from "../modules/ui/index.js";
import { type AbsolutePath, flattenTree, isAbsolutePath, type TreeElement } from "../modules/util/index.js";
import { APP_DESCRIPTION, APP_LANGUAGE, APP_TITLE, APP_URL } from "./env.js";

/**
 * Render every page in `root` to static HTML and write it under `outdir`.
 * - `/` writes to `outdir/index.html`; `/foo/bar` writes to `outdir/foo/bar/index.html`.
 *
 * @param script Site-root-relative URL of the client bundle (e.g. `/client-abc123.js`).
 * @param stylesheet Site-root-relative URL of the stylesheet (e.g. `/client-abc123.css`).
 * @returns The number of pages written.
 */
export async function renderApp(tree: TreeElement, outdir: AbsolutePath, script: AbsolutePath, stylesheet: AbsolutePath): Promise<number> {
	// Flattening stamps a canonical `path` on every element and keys the map by it; the path-shaped keys are exactly the set of pages to render (one per element).
	// The index page (`/all`) is a `<TreeApp>` fallback route, not a tree node, so add it explicitly.
	const paths: AbsolutePath[] = [
		...Array.from(flattenTree(tree).keys()).filter(isAbsolutePath), //
		"/search",
	];

	for (const path of paths) {
		// Raw meta for this page — embedded in the HTML so the browser can rebuild the identical app while hydrating.
		// `path` is site-absolute (`/util`); the `.` prefix resolves it *under* `APP_URL`'s subfolder, not its origin.
		const meta = createMeta({
			url: `.${path}`,
			root: APP_URL,
			app: APP_TITLE,
			description: APP_DESCRIPTION,
			language: APP_LANGUAGE,
			stylesheets: [stylesheet],
			modules: [script],
			tags: { viewport: "width=device-width, initial-scale=1" },
		});
		// The app renders straight into `<body>`, which `client.tsx` hydrates directly.
		const html = `<!DOCTYPE html>${renderToString(
			<HTML {...meta}>
				<DocumentationApp tree={tree} />
				<script type="application/json" id="docs-data">
					{JSON.stringify(meta)}
				</script>
			</HTML>,
		)}`;
		const filePath = path === "/" ? join(outdir, "index.html") : join(outdir, path.slice(1), "index.html");
		await mkdir(dirname(filePath), { recursive: true });
		await Bun.write(filePath, html);
	}

	return paths.length;
}
