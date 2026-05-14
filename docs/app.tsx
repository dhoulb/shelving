import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { DirectoryExtractor } from "../modules/extract/DirectoryExtractor.js";
import { Meta } from "../modules/ui/misc/Meta.js";
import { HTML } from "../modules/ui/page/HTML.js";
import { RouterOutput } from "../modules/ui/router/Router.js";
import { TreeApp } from "../modules/ui/tree/TreeApp.js";
import { getElementPaths } from "../modules/util/element.js";
import { type AbsolutePath, joinAbsolutePath } from "../modules/util/path.js";
import { buildCSS } from "./css.js";
import { APP_DESCRIPTION, APP_LANGUAGE, APP_TITLE, APP_URL } from "./env.js";

/**
 * Render `app` to an HTML string for a given URL path.
 * - Wraps `app` in a `<Meta>` context that sets the current page URL.
 * - Returns a full HTML document including `<!DOCTYPE html>`.
 */
export function renderPage(app: ReactElement, path: AbsolutePath): string {
	const html = renderToString(
		<Meta url={path} base={APP_URL}>
			{app}
		</Meta>,
	);
	return `<!DOCTYPE html>${html}`;
}

/**
 * Render `app` for `path` and write it to `outdir` at the appropriate `index.html` location.
 * - `/` writes to `outdir/index.html`.
 * - `/foo/bar` writes to `outdir/foo/bar/index.html`.
 */
export async function buildPage(app: ReactElement, path: AbsolutePath, outdir: AbsolutePath): Promise<void> {
	const html = renderPage(app, path);
	const filePath = path === "/" ? join(outdir, "index.html") : join(outdir, path.slice(1), "index.html");
	await mkdir(dirname(filePath), { recursive: true });
	await Bun.write(filePath, html);
}

/**
 * Build the entire documentation site to `outdir`.
 * - Builds the stylesheet via `buildCSS()` (bundles this file's CSS module imports).
 * - Renders one page per element in `root`, plus the root index at `/`.
 */
export async function buildApp(entrypoint: AbsolutePath, outdir: AbsolutePath): Promise<void> {
	// Clean up first.
	await rm(outdir, { recursive: true, force: true });
	await mkdir(outdir, { recursive: true });

	// Extract the directory tree from `entrypoint`.
	const root = await new DirectoryExtractor().extract(entrypoint);

	const startTime = performance.now();

	console.warn("Building stylesheet...");
	const stylesheet = await buildCSS(import.meta.path as AbsolutePath, outdir);
	console.warn(`  Stylesheet: ${stylesheet}`);

	// Compose the site-wide `app` element.
	// Per-page content is mounted by `<TreeApp>` itself via its catch-all route, so there's no per-path branch here.
	const app = (
		<HTML>
			<TreeApp
				tree={root}
				app={APP_TITLE}
				description={APP_DESCRIPTION}
				language={APP_LANGUAGE}
				base={APP_URL}
				stylesheets={[stylesheet]}
				tags={{ viewport: "width=device-width, initial-scale=1" }}
			>
				<RouterOutput />
			</TreeApp>
		</HTML>
	);

	// Collect renderable paths: "/" plus every element in the tree.
	const paths: AbsolutePath[] = Array.from(getElementPaths(root)).map(joinAbsolutePath);

	console.warn(`Rendering ${paths.length} pages...`);
	let renderedCount = 0;
	for (const path of paths) {
		await buildPage(app, path, outdir);
		renderedCount++;
	}

	const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
	console.warn(`  Rendered ${renderedCount} pages`);

	console.warn(`Done in ${elapsed}s → ${outdir}`);
}
