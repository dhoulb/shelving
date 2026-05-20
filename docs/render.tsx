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
 * EXPERIMENT: foreign elements spliced onto the end of `<body>` after rendering.
 * - They are never part of any React render — the same situation a browser extension or third-party
 *   script creates — so they test whether hydrating `<body>` directly tolerates unknown trailing nodes.
 */
const _EXPERIMENT_EXTRAS = `<div data-experiment="a" style="background:#ffe01a;padding:.5rem;text-align:center;font-family:sans-serif">Experiment A — element injected into the body after render</div><div data-experiment="b" style="background:#8ce814;padding:.5rem;text-align:center;font-family:sans-serif">Experiment B — a second injected element</div>`;

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
		// EXPERIMENT: render the app straight into `<body id="root">` (no wrapper div), then splice foreign
		// elements onto the end of `<body>` — `client.tsx` hydrates `<body>` itself, so this tests tolerance.
		const rendered = renderToString(
			<HTML app={APP_TITLE} language={APP_LANGUAGE} root={APP_URL}>
				<App tree={root} meta={meta} />
				<script type="application/json" id="docs-data">
					{JSON.stringify(meta)}
				</script>
			</HTML>,
		);
		const html = `<!DOCTYPE html>${rendered.replace("</body>", `${_EXPERIMENT_EXTRAS}</body>`)}`;
		const filePath = path === "/" ? join(outdir, "index.html") : join(outdir, path.slice(1), "index.html");
		await mkdir(dirname(filePath), { recursive: true });
		await Bun.write(filePath, html);
	}

	return paths.length;
}
