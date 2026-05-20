/**
 * Render side of the docs build pipeline.
 *
 * This file is bundled by `Bun.build` (orchestrated from `docs/build.tsx`) so that `.module.css` imports inside `modules/ui/**` resolve to proper hashed class-name objects.
 * The bundler emits matching hashed names in both the JS bundle and the CSS asset.
 *
 * The orchestrator imports `renderAllPages` from the produced bundle.
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { renderToString } from "react-dom/server";
import { MetaContext } from "../modules/ui/misc/MetaContext.js";
import { HTML } from "../modules/ui/page/HTML.js";
import { Navigation } from "../modules/ui/router/Navigation.js";
import { TreeApp } from "../modules/ui/tree/TreeApp.js";
import { getElementPaths, type TreeElement } from "../modules/util/element.js";
import { requireURL } from "../modules/util/index.js";
import { type AbsolutePath, joinPath } from "../modules/util/path.js";
import { APP_DESCRIPTION, APP_LANGUAGE, APP_TITLE, APP_URL } from "./env.js";

/**
 * Render every page in `root` to static HTML and write it under `outdir`.
 * - `/` writes to `outdir/index.html`; `/foo/bar` writes to `outdir/foo/bar/index.html`.
 * - The stylesheet URL (e.g. `/render-abc123.css`) is set on the `<HTML>` shell as a hoistable `<link rel="stylesheet">`.
 *
 * @returns The number of pages written.
 */
export async function renderApp(root: TreeElement, outdir: AbsolutePath, stylesheet: AbsolutePath): Promise<number> {
	// Compose the site-wide `app` element once — per-page content is mounted by `<TreeApp>`'s catch-all route.
	const app = (
		<HTML
			app={APP_TITLE}
			description={APP_DESCRIPTION}
			language={APP_LANGUAGE}
			root={APP_URL}
			stylesheets={[stylesheet]}
			tags={{ viewport: "width=device-width, initial-scale=1" }}
		>
			<Navigation>
				<TreeApp tree={root} />
			</Navigation>
		</HTML>
	);

	const paths: AbsolutePath[] = Array.from(getElementPaths(root)).map(segments => joinPath("/", segments));

	for (const path of paths) {
		// `path` is site-absolute (`/util`); the `.` prefix makes it resolve *under* `APP_URL`'s subfolder instead of its origin.
		const html = `<!DOCTYPE html>${renderToString(<MetaContext value={{ url: requireURL(`.${path}`, APP_URL), root: APP_URL }}>{app}</MetaContext>)}`;
		const filePath = path === "/" ? join(outdir, "index.html") : join(outdir, path.slice(1), "index.html");
		await mkdir(dirname(filePath), { recursive: true });
		await Bun.write(filePath, html);
	}

	return paths.length;
}
