/**
 * Browser entry point.
 *
 * Bundled with `target: "browser"` (see `docs/build.tsx`) and loaded on every page. It rebuilds the
 * exact React tree the server rendered and hands it to `hydrateRoot()`, which adopts the existing
 * server HTML inside `<body>` and makes it interactive — from then on `<Navigation>` handles routing.
 *
 * The page embeds its meta as JSON (`#docs-data`); the larger element tree is fetched once from
 * `tree.json`. The script is `async`, so we wait for the DOM before reading either.
 */

import { hydrateRoot } from "react-dom/client";
import { DocumentationApp } from "../modules/ui/docs/DocumentationApp.js";
import type { PossibleMeta } from "../modules/ui/util/meta.js";
import { requireURL } from "../modules/util/index.js";
import type { TreeElement } from "../modules/util/tree.js";

async function hydrate(): Promise<void> {
	const data = document.getElementById("docs-data")?.textContent;
	if (!data) return;

	const meta = JSON.parse(data) as PossibleMeta;
	const tree = (await fetch(requireURL("tree.json", meta.root).href).then(r => r.json())) as TreeElement;

	// Hydrate `<body>` directly — React 19 tolerates the trailing nodes outside its tree.
	hydrateRoot(document.body, <DocumentationApp tree={tree} {...meta} />);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => void hydrate());
else void hydrate();
