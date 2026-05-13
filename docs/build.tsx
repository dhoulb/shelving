/**
 * Static documentation site builder.
 *
 * Extracts tree elements from `modules/`, renders every page to static HTML,
 * and writes the result to `.build/docs/`.
 *
 * ## CSS module strategy
 *
 * Bun's runtime doesn't resolve CSS module imports — it only does so during bundling.
 * So we first `Bun.build()` this script itself with `target: "bun"`, which resolves
 * CSS module class names in the JS and extracts CSS into a separate file. Then we
 * exec the bundled output, which has working CSS module references.
 *
 * Run with `bun run docs` (see `package.json`).
 */

import { join } from "node:path";

// --- Bootstrap: bundle this script then run the bundle ---

const SCRIPT_ROOT = join(import.meta.dir, "..");
const OUTPUT_DIR = join(SCRIPT_ROOT, ".build/docs");
const BUNDLE_PATH = join(OUTPUT_DIR, "build-bundle.js");

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

import { extractModules, renderPage } from "./docs.js";

const PROJECT_ROOT = process.env.DOCS_ROOT ?? SCRIPT_ROOT;
const MODULES_DIR = join(PROJECT_ROOT, "modules");
const DOCS_OUTPUT_DIR = join(PROJECT_ROOT, ".build/docs");

const startTime = performance.now();

// Extract elements from modules/.
console.warn("Extracting elements from modules/...");
const { elements, paths } = await extractModules(MODULES_DIR);
console.warn(`  Extracted ${elements.length} modules`);
console.warn(`Rendering ${paths.length} pages...`);

// Render each path to a static HTML file.
let rendered = 0;
for (const urlPath of paths) {
	const html = renderPage(elements, urlPath);

	// Write to output directory — `/util/array` → `.build/docs/util/array/index.html`
	const filePath = urlPath === "/" ? join(DOCS_OUTPUT_DIR, "index.html") : join(DOCS_OUTPUT_DIR, urlPath.slice(1), "index.html");

	const dir = filePath.slice(0, filePath.lastIndexOf("/"));
	await Bun.spawn(["mkdir", "-p", dir]).exited;
	await Bun.write(filePath, html);
	rendered++;
}

const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
console.warn(`Done! Rendered ${rendered} pages in ${elapsed}s → ${DOCS_OUTPUT_DIR}`);
