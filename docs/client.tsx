/**
 * Browser entry point for the hydration spike.
 *
 * Bundled separately from `render.tsx` (see `docs/build.tsx`) with `target: "browser"`. It is loaded
 * on every page via the `modules` meta, which renders a hoisted `<script type="module" async>` and
 * resolves the URL against the site root so it works under sub-paths (e.g. the PR preview).
 *
 * `hydrateRoot()` does NOT re-render the page from scratch — it walks the server-rendered DOM already
 * inside `#hydration-probe`, reuses those elements, and attaches React's event listeners and state.
 *
 * Because the script is `async` (required for React to hoist it) it can run before the page has
 * finished parsing, so we wait for the DOM to be ready before looking for the container.
 */

import { hydrateRoot } from "react-dom/client";
import { HydrationProbe } from "./HydrationProbe.js";

function hydrate(): void {
	const container = document.getElementById("hydration-probe");
	if (container) hydrateRoot(container, <HydrationProbe />);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hydrate);
else hydrate();
