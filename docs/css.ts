import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import type { AbsolutePath } from "../modules/util/path.js";

/**
 * Build `entrypoint` with `Bun.build()` and copy the resulting CSS asset into `outdir`.
 * - Bundles to a temporary directory purely to extract the CSS asset that Bun emits when
 *   the entrypoint (or anything it imports) uses `*.module.css` imports.
 * - Only the `.css` file is kept — the bundled JS is discarded.
 *
 * @param entrypoint Absolute filesystem path to the script whose CSS module imports should be collected.
 * @param outdir Absolute filesystem path to the directory the CSS file should be written into.
 * @returns The website-absolute URL path of the copied CSS file (e.g. `/index-abc123.css`).
 * @throws {Error} if the build fails or no CSS asset is produced.
 */
export async function buildCSS(entrypoint: AbsolutePath, outdir: AbsolutePath): Promise<AbsolutePath> {
	const tempdir = await mkdtemp(join(tmpdir(), "shelving-css-"));
	try {
		const result = await Bun.build({
			entrypoints: [entrypoint],
			outdir: tempdir,
			target: "bun",
			naming: { entry: "[name]-bundle.[ext]", asset: "[name]-[hash].[ext]" },
			minify: false,
			external: ["typescript"],
		});
		if (!result.success) {
			for (const log of result.logs) console.error(log);
			throw new Error("Failed to build CSS");
		}

		// Find the produced `.css` asset.
		const cssOutput = result.outputs.find(o => o.path.endsWith(".css"));
		if (!cssOutput) throw new Error("No CSS asset produced by Bun.build");

		// Copy it to `outdir` under its original filename.
		const cssFilename = basename(cssOutput.path);
		const destPath = join(outdir, cssFilename);
		await Bun.write(destPath, Bun.file(cssOutput.path));

		return `/${cssFilename}`;
	} finally {
		await rm(tempdir, { recursive: true, force: true });
	}
}
