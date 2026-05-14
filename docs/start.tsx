/**
 * Documentation site dev server.
 *
 * Builds the static site, serves it locally with Bun's HTTP server, and rebuilds when `modules/` changes.
 *
 * Run with `bun run docs:start` (see `package.json`).
 */

import { watch } from "node:fs";
import { join } from "node:path";
import { buildApp } from "./app.js";
import { APP_URL, MODULES_DIR, OUTPUT_DIR } from "./env.js";

// Build the static site first, then serve it.
await buildApp(MODULES_DIR, OUTPUT_DIR);

// Serve static files.
Bun.serve({
	port: APP_URL.port,
	async fetch(req) {
		const { pathname } = new URL(req.url);
		for (const candidate of [join(OUTPUT_DIR, pathname), join(OUTPUT_DIR, pathname, "index.html"), join(OUTPUT_DIR, "index.html")]) {
			const file = Bun.file(candidate);
			if (await file.exists()) return new Response(file);
		}
		return new Response("Not Found", { status: 404 });
	},
});

console.warn(`\nDev server running at ${APP_URL.href}`);

// Rebuild on changes (debounced).
let rebuildTimer: Timer | undefined;
watch(MODULES_DIR, { recursive: true }, (_event, filename) => {
	clearTimeout(rebuildTimer);
	rebuildTimer = setTimeout(async () => {
		console.warn(`\nFile changed: ${filename}`);
		try {
			// Build the static site first, then serve it.
			await buildApp(MODULES_DIR, OUTPUT_DIR);

			console.warn("Ready.");
		} catch (error) {
			console.error("Rebuild failed:", error);
		}
	}, 200);
});

console.warn("Watching /modules for changes...\n");
