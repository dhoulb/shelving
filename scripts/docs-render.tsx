import { globSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { renderRoutes } from "../modules/render/render.js";
import { DocsApp } from "../modules/ui/docs/DocsApp.js";
import { type DocsFile, type DocsNode, parseDocs } from "../modules/util/docs.js";

// Bundled by `scripts/docs.tsx` via `Bun.build`. Bun resolves `*.module.css` imports
// natively, so this entry can use the rest of `shelving/ui` without a runtime plugin.

const OUTPUT_PATH = join(process.cwd(), ".build/docs");

// 1. Crawl every documentable source file under `modules/`.
const paths = globSync("modules/**/*.{ts,tsx,md}", {
	exclude: ["modules/test/**/*", "**/*.test.ts", "**/*.test.tsx"],
});
const files: DocsFile[] = await Promise.all(
	paths.map(async path => ({ path: path.replace(/^modules\//, ""), content: await readFile(path, "utf8") })),
);

// 2. Parse → tokens.
const tokens = parseDocs(files, {
	title: "shelving",
	extras: [{ path: "storybook", slot: "storybook", title: "UI library", lede: "Live examples of every component in shelving/ui." }],
});

// 3. Collect every URL that needs rendering. Use a synthetic origin — the deployed origin is unknown at build time, but every internal href is relative.
const allPaths: string[] = ["", ...tokens.extras.map(e => e.path), ...Array.from(_collectPaths(tokens.root))];
const urls = allPaths.map(p => new URL(`/${p}`, "http://localhost/"));

// 4. Render every URL through DocsApp.
const html = renderRoutes(<DocsApp tokens={tokens} />, urls);

// 5. Write each rendered page to disk at `<path>/index.html`.
for (const url of urls) {
	const path = url.pathname.replace(/^\/|\/$/g, "");
	const file = resolve(OUTPUT_PATH, path, "index.html");
	await mkdir(dirname(file), { recursive: true });
	await writeFile(file, html[String(url)] ?? "", "utf8");
}

function* _collectPaths(node: DocsNode): Iterable<string> {
	if (node.kind === "file") {
		// Strip the file extension to match the URL of the rendered page.
		const lastSlash = node.path.lastIndexOf("/");
		const dir = lastSlash >= 0 ? node.path.slice(0, lastSlash) : "";
		const base = lastSlash >= 0 ? node.path.slice(lastSlash + 1) : node.path;
		const dot = base.lastIndexOf(".");
		const stripped = dot > 0 ? base.slice(0, dot) : base;
		// README files are folded into the parent directory's description; don't emit a separate page.
		if (stripped === "README") return;
		yield dir ? `${dir}/${stripped}` : stripped;
		return;
	}
	if (node.path) yield node.path;
	for (const child of node.children ?? []) yield* _collectPaths(child);
}
