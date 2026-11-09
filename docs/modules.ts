/**
 * Build shelving as native browser modules, for the playground frame (see `docs/frame.tsx`).
 *
 * Every browser-safe `package.json` export becomes an entry point, so `shelving/ui`, `shelving/util/array`, and
 * the others each have their own module file. Shared code goes into chunks, so each module loads only once.
 * `react` and `react-dom` stay external: the frame's import map loads them from esm.sh.
 */

import { relative, resolve } from "node:path";
import { Glob } from "bun";
import type { AbsolutePath } from "../modules/util/path.js";

/** Exports that cannot run in a browser. */
const SKIP = new Set(["./bun", "./cloudflare", "./extract", "./firebase", "./test"]);

/** Versions of the external packages, from esm.sh. These match the `react` and `react-dom` versions in `package.json`. */
const REACT = "https://esm.sh/react@19.3.1";
const REACT_DOM = "https://esm.sh/react-dom@19.3.1";

/** Import map entries for the external packages. React DOM uses the same React module as everything else (`deps`). */
const EXTERNAL_IMPORTS = {
	react: REACT,
	"react/jsx-runtime": `${REACT}/jsx-runtime`,
	"react/jsx-dev-runtime": `${REACT}/jsx-dev-runtime`,
	"react-dom": `${REACT_DOM}?deps=react@19.3.1`,
	"react-dom/client": `${REACT_DOM}/client?deps=react@19.3.1`,
};

/** URL of the TypeScript compiler that the frame loads to transpile TSX. */
export const TYPESCRIPT_URL = "https://esm.sh/typescript@6.0.3";

/** What `buildModules()` made: an import map and the stylesheets to link. */
export interface BuiltModules {
	/** Import map `imports`, with URLs relative to the site root. */
	readonly imports: Readonly<Record<string, string>>;
	/** Stylesheet URLs relative to the site root. */
	readonly stylesheets: readonly string[];
}

/**
 * Build every browser-safe shelving export as an ES module under `outdir/<folder>/`.
 *
 * @param sourceDir The `modules/` source directory.
 * @param packageJson Path of `package.json`, which lists the exports.
 * @param outdir The docs site output directory.
 * @param folder The folder under `outdir` for the modules.
 */
export async function buildModules(
	sourceDir: AbsolutePath,
	packageJson: AbsolutePath,
	outdir: AbsolutePath,
	folder = "esm",
): Promise<BuiltModules> {
	const { exports } = (await Bun.file(packageJson).json()) as { exports: Record<string, string> };

	// Map each export subpath (`shelving/ui`) to its source file (`modules/ui/index.ts`).
	const entries = new Map<string, string>();
	for (const [subpath, target] of Object.entries(exports)) {
		if (SKIP.has(subpath)) continue;
		const specifier = subpath === "." ? "shelving" : `shelving/${subpath.slice(2)}`;
		const source = resolve(sourceDir, target.slice(2).replace(/\.js$/, ".ts"));
		if (!source.includes("*")) {
			entries.set(specifier, source);
			continue;
		}
		// Expand a wildcard export (`./util/*`) to one entry per file.
		const [before = "", after = ""] = source.split("*");
		for await (const file of new Glob(relative(sourceDir, source)).scan(sourceDir)) {
			if (file.endsWith(".test.ts")) continue;
			const path = resolve(sourceDir, file);
			entries.set(specifier.replace("*", path.slice(before.length, path.length - after.length)), path);
		}
	}

	const result = await Bun.build({
		entrypoints: Array.from(entries.values()),
		root: sourceDir,
		outdir: resolve(outdir, folder),
		target: "browser",
		format: "esm",
		splitting: true,
		minify: true,
		external: ["react", "react/*", "react-dom", "react-dom/*"],
		naming: { entry: "[dir]/[name].[ext]", chunk: "chunk-[hash].[ext]", asset: "[dir]/[name]-[hash].[ext]" },
		define: { "process.env.NODE_ENV": JSON.stringify("production") },
	});
	if (!result.success) {
		for (const log of result.logs) console.error(log);
		throw new Error("Failed to build browser modules");
	}

	// Each entry point's output file is at the same path as its source, relative to `sourceDir`.
	const imports: Record<string, string> = { ...EXTERNAL_IMPORTS };
	for (const [specifier, source] of entries) imports[specifier] = `./${folder}/${relative(sourceDir, source).replace(/\.tsx?$/, ".js")}`;
	const stylesheets = result.outputs.filter(o => o.path.endsWith(".css")).map(o => `./${relative(outdir, o.path)}`);
	return { imports, stylesheets };
}
