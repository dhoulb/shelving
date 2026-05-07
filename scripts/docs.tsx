import { copyFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

// Build orchestrator. Bundles `docs-render.tsx` with Bun.build (which handles CSS modules
// natively), then runs the bundled entry (it writes HTML pages), then copies the bundled
// CSS asset to `style.css` alongside the HTML.

const BIN_PATH = join(process.cwd(), ".build/docs-bin");
const OUTPUT_PATH = join(process.cwd(), ".build/docs");
const STYLESHEET_NAME = "style.css";

await rm(BIN_PATH, { recursive: true, force: true });
await rm(OUTPUT_PATH, { recursive: true, force: true });
await mkdir(OUTPUT_PATH, { recursive: true });

const result = await Bun.build({
	entrypoints: ["./scripts/docs-render.tsx"],
	outdir: BIN_PATH,
	target: "bun",
});

if (!result.success) {
	for (const log of result.logs) console.error(log);
	process.exit(1);
}

const entry = result.outputs.find(o => o.kind === "entry-point");
const cssAsset = result.outputs.find(o => o.path.endsWith(".css"));
if (!entry) throw new Error("Bun.build did not produce an entry-point");

// Run the bundled render entry — it writes HTML pages to OUTPUT_PATH.
await import(entry.path);

if (cssAsset) await copyFile(cssAsset.path, join(OUTPUT_PATH, STYLESHEET_NAME));

process.stdout.write(`Docs written to ${OUTPUT_PATH}\n`);
