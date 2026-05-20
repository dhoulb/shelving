/**
 * Browser entry point for the hydration spike.
 *
 * This file is bundled separately from `render.tsx` (see `docs/build.tsx`) with `target: "browser"`,
 * and every page loads it via `<script type="module" src="/client.js">`.
 *
 * It does NOT re-render the page from scratch. `hydrateRoot()` walks the server-rendered DOM already
 * inside `#hydration-probe`, reuses those exact elements, and attaches React's event listeners and
 * state to them. After that the component behaves like any normal client-side React app.
 */

import { hydrateRoot } from "react-dom/client";
import { HydrationProbe } from "./HydrationProbe.js";

const container = document.getElementById("hydration-probe");
if (container) hydrateRoot(container, <HydrationProbe />);
