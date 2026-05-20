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
import { HTML } from "../modules/ui/page/HTML.js";
import { getElementPaths, type TreeElement } from "../modules/util/element.js";
import { requireURL } from "../modules/util/index.js";
import { type AbsolutePath, joinPath } from "../modules/util/path.js";
import { App, type AppMeta } from "./App.js";
import { APP_DESCRIPTION, APP_LANGUAGE, APP_TITLE, APP_URL } from "./env.js";

/**
 * Render every page in `root` to static HTML and write it under `outdir`.
 * - `/` writes to `outdir/index.html`; `/foo/bar` writes to `outdir/foo/bar/index.html`.
 *
 * @param script Site-root-relative URL of the client bundle (e.g. `/client-abc123.js`).
 * @param stylesheet Site-root-relative URL of the stylesheet (e.g. `/client-abc123.css`).
 * @returns The number of pages written.
 */
export async function renderApp(root: TreeElement, outdir: AbsolutePath, script: AbsolutePath, stylesheet: AbsolutePath): Promise<number> {
	const paths: AbsolutePath[] = Array.from(getElementPaths(root)).map(segments => joinPath("/", segments));

	for (const path of paths) {
		// Raw meta for this page — embedded in the HTML so the browser can rebuild the identical app while hydrating.
		// `path` is site-absolute (`/util`); the `.` prefix resolves it *under* `APP_URL`'s subfolder, not its origin.
		const meta: AppMeta = {
			url: requireURL(`.${path}`, APP_URL).href,
			root: APP_URL.href,
			app: APP_TITLE,
			description: APP_DESCRIPTION,
			language: APP_LANGUAGE,
			stylesheets: [stylesheet],
			modules: [script],
			tags: { viewport: "width=device-width, initial-scale=1" },
		};
		const html = `<!DOCTYPE html>${renderToString(
			<HTML app={APP_TITLE} language={APP_LANGUAGE} root={APP_URL}>
				<div id="app">
					<App tree={root} meta={meta} />
				</div>
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
