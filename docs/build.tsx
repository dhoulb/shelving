import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { DirectoryExtractor } from "../modules/extract/DirectoryExtractor.js";
import type { TreeElement } from "../modules/util/element.js";
import type { AbsolutePath } from "../modules/util/path.js";
import { MODULES_DIR, OUTPUT_DIR } from "./env.js";

/** Shape exposed by the bundled `docs/render.tsx` module. */
interface RenderModule {
	readonly renderApp: (root: TreeElement, outdir: AbsolutePath, stylesheet: AbsolutePath) => Promise<number>;
}

/**
 * Build the entire documentation site to `outdir`.
 *
 * Pipeline:
 * 1. Extract the directory tree from `entrypoint`.
 * 2. Bundle `docs/render.tsx` via `Bun.build` into a temporary directory. This processes every `.module.css` import in the dependency graph, emitting matching hashed class names in the JS bundle and the CSS asset.
 * 3. Copy the CSS asset into `outdir` so the rendered HTML can link to it.
 * 4. Import the bundled JS module and call its `renderApp` to write every page.
 */
export async function buildApp(entrypoint: AbsolutePath, outdir: AbsolutePath): Promise<void> {
	// Clean up first.
	await rm(outdir, { recursive: true, force: true });
	await mkdir(outdir, { recursive: true });

	const startTime = performance.now();

	// Extract the directory tree from `entrypoint`.
	console.warn("Extracting tree...");
	const root = await new DirectoryExtractor().extract(entrypoint);

	// Bundle `docs/render.tsx` (and everything it imports, including `.module.css` files).
	console.warn("Bundling render script...");
	const renderEntrypoint = join(import.meta.dir, "render.tsx") as AbsolutePath;
	const tempdir = await mkdtemp(join(tmpdir(), "shelving-docs-"));
	try {
		const result = await Bun.build({
			entrypoints: [renderEntrypoint],
			outdir: tempdir,
			target: "bun",
			naming: { entry: "[name]-[hash].[ext]", asset: "[name]-[hash].[ext]" },
			minify: false,
			external: ["typescript"],
		});
		if (!result.success) {
			for (const log of result.logs) console.error(log);
			throw new Error("Failed to bundle render script");
		}

		// Find the paths to the JS file and the CSS file.
		const jsPath = result.outputs.find(o => o.kind === "entry-point" && o.path.endsWith(".js"));
		const cssPath = result.outputs.find(o => o.path.endsWith(".css"));
		if (!jsPath) throw new Error("Bundle produced no JS entry");
		if (!cssPath) throw new Error("Bundle produced no CSS asset");

		// Copy the stylesheet into `outdir` so the rendered HTML can link to it.
		const stylesheet = basename(cssPath.path);
		await Bun.write(join(outdir, stylesheet), Bun.file(cssPath.path));
		console.warn(`  Stylesheet: ${stylesheet}`);

		// Import the bundled JS module — `.module.css` imports now resolve to hashed class-name objects that match the CSS asset.
		const { renderApp } = (await import(jsPath.path)) as RenderModule;

		console.warn("Rendering pages...");
		const count = await renderApp(root, outdir, `/${stylesheet}`);
		console.warn(`  Rendered ${count} pages`);
	} finally {
		await rm(tempdir, { recursive: true, force: true });
	}

	const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
	console.warn(`Done in ${elapsed}s → ${outdir}`);
}

/** Build the app now. */
await buildApp(MODULES_DIR, OUTPUT_DIR);
