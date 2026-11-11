/**
 * Build the playground frame page (`frame.html`) and what it needs.
 *
 * - `esm/`: shelving as native browser modules (see `docs/modules.ts`).
 * - `frame-[hash].js`: the frame script (see `docs/frame.tsx`), with `shelving/*`, `react`, and `react-dom` kept external.
 * - `frame.html`: an import map, the shelving stylesheets, a `<style id="css">` for the playground CSS, and the frame script.
 * - `variables.json`: the CSS variable index for the playground (see `docs/variables.ts`).
 * - `components.json`: the component index for the playground (see `docs/components.ts`).
 *
 * The frame page loads no docs site styles, so a preview shows the raw shelving styles.
 */

import { basename, join, resolve } from "node:path";
import { PLAYGROUND_COMPONENTS_PATH, PLAYGROUND_FRAME_PATH, PLAYGROUND_VARIABLES_PATH } from "../modules/ui/docs/playground.js";
import type { AbsolutePath } from "../modules/util/path.js";
import { buildComponents } from "./components.js";
import { buildModules, TYPESCRIPT_URL } from "./modules.js";
import { buildVariables } from "./variables.js";

/** Escape text for an HTML attribute or a `<script>` body. */
function _escape(text: string): string {
	return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
}

/**
 * Write the playground frame page, the shelving browser modules, and the CSS variable and component indexes to `outdir`.
 *
 * @param sourceDir The `modules/` source directory.
 * @param packageJson Path of `package.json`.
 * @param outdir The docs site output directory.
 */
export async function buildFrame(sourceDir: AbsolutePath, packageJson: AbsolutePath, outdir: AbsolutePath): Promise<void> {
	const { imports, stylesheets } = await buildModules(sourceDir, packageJson, outdir);
	console.warn(`  Browser modules: ${Object.keys(imports).length} imports, ${stylesheets.length} stylesheets`);

	const frame = await Bun.build({
		entrypoints: [join(import.meta.dir, "frame.tsx")],
		outdir,
		target: "browser",
		format: "esm",
		minify: true,
		external: ["shelving", "shelving/*", "react", "react/*", "react-dom", "react-dom/*"],
		naming: { entry: "[name]-[hash].[ext]" },
		define: { TYPESCRIPT_URL: JSON.stringify(TYPESCRIPT_URL), "process.env.NODE_ENV": JSON.stringify("production") },
	});
	if (!frame.success) {
		for (const log of frame.logs) console.error(log);
		throw new Error("Failed to bundle frame script");
	}
	const script = frame.outputs.find(o => o.kind === "entry-point");
	if (!script) throw new Error("Frame bundle produced no JS entry");

	// The import map goes in a `<script>` body, so `<` is escaped as a JSON unicode escape.
	const importmap = JSON.stringify({ imports }).replaceAll("<", "\\u003c");
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Playground frame</title>
<script type="importmap">${importmap}</script>
${stylesheets.map(href => `<link rel="stylesheet" href="${_escape(href)}">`).join("\n")}
<style>body { margin: 0; } #root { display: flow-root; padding: var(--space-normal, 16px); }</style>
<style id="css"></style>
<script type="module" src="./${_escape(basename(script.path))}"></script>
</head>
<body>
<div id="root"></div>
</body>
</html>
`;
	await Bun.write(resolve(outdir, PLAYGROUND_FRAME_PATH), html);
	const uiDir = resolve(sourceDir, "ui") as AbsolutePath;
	await Bun.write(resolve(outdir, PLAYGROUND_VARIABLES_PATH), JSON.stringify(await buildVariables(uiDir)));
	await Bun.write(resolve(outdir, PLAYGROUND_COMPONENTS_PATH), JSON.stringify(await buildComponents(uiDir)));
}
