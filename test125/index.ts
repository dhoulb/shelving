/**
 * Issue #125 demo server.
 *
 * Builds `client.tsx` with `Bun.build` (the same path the docs site uses — `docs/build.tsx`) and serves
 * the resulting JS + CSS as plain static assets. Watches `modules/ui/` and `test125/` for changes —
 * rebuilds on any file change, then notifies connected browsers via SSE so the page auto-reloads.
 */

import { watch } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const ROOT = import.meta.dir;
const REPO = resolve(ROOT, "..");
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

// Live-reload via SSE. Each connected browser holds a writable stream; on rebuild we write a single
// "reload" event and the in-page `EventSource` listener calls `location.reload()`.
const clients = new Set<WritableStreamDefaultWriter<Uint8Array>>();
const encoder = new TextEncoder();

function notifyReload(): void {
	for (const writer of clients) writer.write(encoder.encode("event: reload\ndata: \n\n")).catch(() => clients.delete(writer));
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Issue #125 — themed --card-color-bg defeats variants</title>
	<link rel="stylesheet" href="/style.css" />
	<script>
		new EventSource("/events").addEventListener("reload", () => location.reload());
	</script>
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
		if (pathname === "/events") {
			const { readable, writable } = new TransformStream<Uint8Array>();
			const writer = writable.getWriter();
			clients.add(writer);
			req.signal.addEventListener("abort", () => {
				clients.delete(writer);
				// Promise rejection here means the stream was already closed by the other side; safe to swallow.
				writer.close().catch(() => undefined);
			});
			return new Response(readable, {
				headers: {
					"content-type": "text/event-stream",
					"cache-control": "no-cache",
					connection: "keep-alive",
				},
			});
		}
		return new Response("Not Found", { status: 404 });
	},
});

// Watch the codebase for changes. Bun has a single rebuild "tick" — debounce so we don't trigger
// dozens of rebuilds for a save that fires multiple FS events.
let rebuildTimer: Timer | undefined;
function scheduleRebuild(file: string): void {
	clearTimeout(rebuildTimer);
	rebuildTimer = setTimeout(async () => {
		try {
			console.warn(`Rebuilding after change: ${file}`);
			({ js, css } = await bundle());
			notifyReload();
			console.warn(`  Reloaded ${clients.size} client(s).`);
		} catch (error) {
			console.error("Rebuild failed:", error);
		}
	}, 150);
}

for (const dir of [join(REPO, "modules/ui"), ROOT]) {
	watch(dir, { recursive: true }, (_event, filename) => {
		if (filename && /\.(tsx?|css)$/.test(filename)) scheduleRebuild(filename);
	});
}

console.warn(`Test #125 site running at ${server.url}`);
console.warn("Watching modules/ui/ and test125/ for changes — pages auto-reload on save.");

process.on("SIGINT", async () => {
	await rm(TEMP, { recursive: true, force: true });
	process.exit(0);
});
