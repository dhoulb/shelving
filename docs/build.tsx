import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { DirectoryExtractor } from "../modules/extract/DirectoryExtractor.js";
import { IndexExtractor } from "../modules/extract/IndexExtractor.js";
import { MergingExtractor } from "../modules/extract/MergingExtractor.js";
import { PackageExtractor } from "../modules/extract/PackageExtractor.js";
import type { AbsolutePath } from "../modules/util/path.js";
import type { TreeElement } from "../modules/util/tree.js";
import { MODULES_DIR, OUTPUT_DIR, PACKAGE_JSON_PATH } from "./env.js";

/** Shape exposed by the bundled `docs/render.tsx` module. */
interface RenderModule {
	readonly renderApp: (root: TreeElement, outdir: AbsolutePath, script: AbsolutePath, stylesheet: AbsolutePath) => Promise<number>;
}

/**
 * Build the entire documentation site to `outdir`.
 *
 * Pipeline:
 * 1. Walk the source `modules/` directory, merge `.md` siblings into their `.ts` counterparts, and absorb each
 *    directory's `README.md` into the directory element itself.
 * 2. Read the package.json and produce the module tree — one `kind: "module"` entry per export. Write it to
 *    `tree.json` for the browser to hydrate from.
 * 3. Bundle `docs/client.tsx` for the browser — this single build yields BOTH browser assets: the client JS
 *    and the CSS extracted from every `.module.css` imported across the component tree.
 * 4. Bundle `docs/render.tsx` for Bun — the server-side renderer. It resolves `.module.css` imports to the
 *    same hashed class names (so its markup matches the browser CSS); its own CSS output is discarded.
 * 5. Import the bundled renderer and call `renderApp` to write every page, linking the two browser assets.
 */
export async function buildApp(sourceDir: AbsolutePath, packageJson: AbsolutePath, outdir: AbsolutePath): Promise<void> {
	// Clean up first.
	await rm(outdir, { recursive: true, force: true });
	await mkdir(outdir, { recursive: true });

	const startTime = performance.now();

	// Extract the source tree (merging `.md` siblings and absorbing README files), then build the module tree from
	// package.json exports. Write the resulting tree for the browser to fetch and hydrate from.
	console.warn("Extracting tree...");
	const tree = await new IndexExtractor(new MergingExtractor(new DirectoryExtractor())).extract(sourceDir);
	const root = await new PackageExtractor({ tree }).extract(packageJson);
	await Bun.write(join(outdir, "tree.json"), JSON.stringify(root));

	const tempdir = await mkdtemp(join(tmpdir(), "shelving-docs-"));
	try {
		// Bundle the browser entry. One build produces both browser assets: the client JS and the CSS
		// (extracted from the `.module.css` files imported across the component tree).
		console.warn("Bundling browser assets...");
		const browser = await Bun.build({
			entrypoints: [join(import.meta.dir, "client.tsx")],
			outdir: tempdir,
			target: "browser",
			naming: { entry: "[name]-[hash].[ext]", asset: "[name]-[hash].[ext]" },
			define: { "process.env.NODE_ENV": JSON.stringify("production") },
			minify: true,
		});
		if (!browser.success) {
			for (const log of browser.logs) console.error(log);
			throw new Error("Failed to bundle browser assets");
		}
		const scriptPath = browser.outputs.find(o => o.kind === "entry-point" && o.path.endsWith(".js"));
		const stylePath = browser.outputs.find(o => o.path.endsWith(".css"));
		if (!scriptPath) throw new Error("Browser bundle produced no JS entry");
		if (!stylePath) throw new Error("Browser bundle produced no CSS asset");
		const script = basename(scriptPath.path);
		const stylesheet = basename(stylePath.path);
		await Bun.write(join(outdir, script), Bun.file(scriptPath.path));
		await Bun.write(join(outdir, stylesheet), Bun.file(stylePath.path));
		console.warn(`  Browser assets: ${script}, ${stylesheet}`);

		// Bundle the server-side renderer (its own CSS output is identical to the browser build's, and discarded).
		console.warn("Bundling render script...");
		const render = await Bun.build({
			entrypoints: [join(import.meta.dir, "render.tsx")],
			outdir: tempdir,
			target: "bun",
			naming: { entry: "[name]-[hash].[ext]", asset: "[name]-[hash].[ext]" },
			minify: false,
			external: ["typescript"],
		});
		if (!render.success) {
			for (const log of render.logs) console.error(log);
			throw new Error("Failed to bundle render script");
		}
		const renderPath = render.outputs.find(o => o.kind === "entry-point" && o.path.endsWith(".js"));
		if (!renderPath) throw new Error("Render bundle produced no JS entry");

		// Import the bundled renderer and write every page, linking the two browser assets.
		const { renderApp } = (await import(renderPath.path)) as RenderModule;
		console.warn("Rendering pages...");
		const count = await renderApp(root, outdir, `/${script}`, `/${stylesheet}`);
		console.warn(`  Rendered ${count} pages`);
	} finally {
		await rm(tempdir, { recursive: true, force: true });
	}

	const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
	console.warn(`Done in ${elapsed}s → ${outdir}`);
}

/** Build the app now. */
await buildApp(MODULES_DIR, PACKAGE_JSON_PATH, OUTPUT_DIR);
