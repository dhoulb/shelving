/**
 * Browser entry point.
 *
 * Bundled with `target: "browser"` (see `docs/build.tsx`) and loaded on every page. It rebuilds the
 * exact React tree the server rendered and hands it to `hydrateRoot()`, which adopts the existing
 * server HTML inside `#app` and makes it interactive — from then on `<Navigation>` handles routing.
 *
 * The page embeds its meta as JSON (`#docs-data`); the larger element tree is fetched once from
 * `tree.json`. The script is `async`, so we wait for the DOM before reading either.
 */

import { hydrateRoot } from "react-dom/client";
import type { TreeElement } from "../modules/util/element.js";
import { requireURL } from "../modules/util/index.js";
import { App, type AppMeta } from "./App.js";

async function hydrate(): Promise<void> {
	const container = document.getElementById("app");
	const data = document.getElementById("docs-data")?.textContent;
	if (!container || !data) return;

	const meta = JSON.parse(data) as AppMeta;
	const tree = (await fetch(requireURL("tree.json", meta.root).href).then(r => r.json())) as TreeElement;

	hydrateRoot(container, <App tree={tree} meta={meta} />);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => void hydrate());
else void hydrate();
