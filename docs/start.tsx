/**
 * Documentation site dev server.
 *
 * Builds the static site then serves it locally with Bun's HTTP server.
 * Watches `modules/` for changes and rebuilds automatically.
 *
 * ## CSS module strategy
 *
 * Same two-pass approach as `build.tsx` — we bundle this script first to resolve
 * CSS module imports, then exec the bundle.
 *
 * Run with `bun run start:docs` (see `package.json`).
 */

import { join } from "node:path";

// --- Bootstrap: bundle this script then run the bundle ---

const SCRIPT_ROOT = join(import.meta.dir, "..");
const OUTPUT_DIR = join(SCRIPT_ROOT, ".build/docs");
const BUNDLE_PATH = join(OUTPUT_DIR, "start-bundle.js");

// If we're NOT running from the bundle, build and exec it.
if (!process.env.DOCS_BUNDLED) {
	// Clean and create output directory.
	await Bun.spawn(["rm", "-rf", OUTPUT_DIR]).exited;
	await Bun.spawn(["mkdir", "-p", OUTPUT_DIR]).exited;

	// Bundle this script — resolves CSS module imports and extracts CSS.
	const result = await Bun.build({
		entrypoints: [import.meta.path],
		outdir: OUTPUT_DIR,
		target: "bun",
		naming: { entry: "[name]-bundle.[ext]", asset: "[name]-[hash].[ext]" },
		minify: false,
		external: ["typescript"], // Keep typescript as external (it's huge and doesn't need bundling).
	});

	if (!result.success) {
		for (const log of result.logs) console.error(log);
		process.exit(1);
	}

	// Find the CSS file produced by the bundler.
	const cssOutput = result.outputs.find(o => o.path.endsWith(".css"));
	const cssFilename = cssOutput ? (cssOutput.path.split("/").pop() ?? "index.css") : "index.css";

	// Run the bundled script with the CSS filename and project root passed via env.
	const proc = Bun.spawn(["bun", BUNDLE_PATH], {
		env: { ...process.env, DOCS_BUNDLED: "1", DOCS_CSS: cssFilename, DOCS_ROOT: SCRIPT_ROOT },
		stdio: ["inherit", "inherit", "inherit"],
	});
	const code = await proc.exited;

	// Clean up the bundle.
	await Bun.spawn(["rm", "-f", BUNDLE_PATH]).exited;

	process.exit(code);
}

// --- From here on we're running inside the bundle (CSS modules are resolved) ---

import { watch } from "node:fs";
import { extractModules, renderPage } from "./docs.js";

const PROJECT_ROOT = process.env.DOCS_ROOT ?? SCRIPT_ROOT;
const MODULES_DIR = join(PROJECT_ROOT, "modules");
const DOCS_OUTPUT_DIR = join(PROJECT_ROOT, ".build/docs");
const PORT = Number(process.env.PORT ?? 3456);

/** Build all pages to disk. */
async function build(): Promise<{ elements: import("../modules/util/element.js").Element[]; paths: string[] }> {
	const startTime = performance.now();
	console.warn("Extracting elements from modules/...");
	const { elements, paths } = await extractModules(MODULES_DIR);
	console.warn(`  Extracted ${elements.length} modules`);
	console.warn(`Rendering ${paths.length} pages...`);

	for (const urlPath of paths) {
		const html = renderPage(elements, urlPath);
		const filePath = urlPath === "/" ? join(DOCS_OUTPUT_DIR, "index.html") : join(DOCS_OUTPUT_DIR, urlPath.slice(1), "index.html");
		const dir = filePath.slice(0, filePath.lastIndexOf("/"));
		await Bun.spawn(["mkdir", "-p", dir]).exited;
		await Bun.write(filePath, html);
	}

	const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
	console.warn(`  Built ${paths.length} pages in ${elapsed}s`);
	return { elements, paths };
}

// Initial build.
await build();

// Start static file server.
Bun.serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		const pathname = url.pathname;

		// Try exact file, then append index.html for directory-style URLs.
		let filePath = join(DOCS_OUTPUT_DIR, pathname);
		let file = Bun.file(filePath);
		if (!(await file.exists())) {
			filePath = join(DOCS_OUTPUT_DIR, pathname, "index.html");
			file = Bun.file(filePath);
		}
		if (!(await file.exists())) {
			// SPA fallback — serve root index for client-side routing.
			filePath = join(DOCS_OUTPUT_DIR, "index.html");
			file = Bun.file(filePath);
		}

		return new Response(file);
	},
});

console.warn(`\nDev server running at http://localhost:${PORT}/`);

// Watch modules/ for changes and rebuild.
let rebuildTimer: Timer | undefined;
watch(MODULES_DIR, { recursive: true }, (_event, filename) => {
	// Debounce rapid changes.
	clearTimeout(rebuildTimer);
	rebuildTimer = setTimeout(async () => {
		console.warn(`\nFile changed: ${filename}`);
		try {
			await build();
			console.warn("Ready.");
		} catch (error) {
			console.error("Rebuild failed:", error);
		}
	}, 200);
});

console.warn("Watching modules/ for changes...\n");
