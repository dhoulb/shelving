/**
 * Issue #125 demo server.
 *
 * Builds `client.tsx` with `Bun.build` (the same path the docs site uses — `docs/build.tsx`) and serves
 * the resulting JS + CSS as plain static assets. Bun's HTML-import dev server has a bug where
 * `.module.css` bindings used at module-eval time (e.g. `App.tsx`, `Block.tsx`) resolve to `undefined`,
 * so we bypass it and use the regular bundler.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = import.meta.dir;
const TEMP = await mkdtemp(join(tmpdir(), "test125-"));

async function bundle(): Promise<{ js: string; css: string }> {
	const result = await Bun.build({
		entrypoints: [join(ROOT, "client.tsx")],
		outdir: TEMP,
		target: "browser",
		naming: { entry: "[name]-[hash].[ext]", asset: "[name]-[hash].[ext]" },
		minify: false,
	});
	if (!result.success) {
		for (const log of result.logs) console.error(log);
		throw new Error("Bundle failed");
	}
	const js = result.outputs.find(o => o.kind === "entry-point" && o.path.endsWith(".js"))?.path;
	const css = result.outputs.find(o => o.path.endsWith(".css"))?.path;
	if (!js || !css) throw new Error("Bundle missing JS or CSS output");
	return { js, css };
}

let { js, css } = await bundle();

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Issue #125 — themed --card-color-bg defeats variants</title>
	<link rel="stylesheet" href="/style.css" />
</head>
<body>
	<script type="module" src="/script.js"></script>
</body>
</html>`;

const server = Bun.serve({
	port: 3125,
	async fetch(req) {
		const { pathname } = new URL(req.url);
		if (pathname === "/") return new Response(HTML, { headers: { "content-type": "text/html" } });
		if (pathname === "/script.js") return new Response(Bun.file(js), { headers: { "content-type": "text/javascript" } });
		if (pathname === "/style.css") return new Response(Bun.file(css), { headers: { "content-type": "text/css" } });
		if (pathname === "/rebuild") {
			({ js, css } = await bundle());
			return new Response("rebuilt");
		}
		return new Response("Not Found", { status: 404 });
	},
});

console.warn(`Test #125 site running at ${server.url}`);
console.warn("Edit files then visit /rebuild (or restart) to pick up changes.");

process.on("SIGINT", async () => {
	await rm(TEMP, { recursive: true, force: true });
	process.exit(0);
});
