import { type ReactElement, useEffect, useState } from "react";

/**
 * Tiny interactive component used to demonstrate server-side rendering and client hydration.
 *
 * - During server rendering only the `useState` initial values are used and `useEffect` never runs,
 *   so the static HTML shows the "not yet hydrated" text and the button does nothing when clicked.
 * - Once the client bundle calls `hydrateRoot()`, React adopts that existing HTML, the `useEffect`
 *   fires, and the `onClick` handler becomes live — the text flips and clicks start counting.
 */
export function HydrationProbe(): ReactElement {
	const [hydrated, setHydrated] = useState(false);
	const [count, setCount] = useState(0);

	// Effects run only in the browser after hydration — never during server rendering.
	useEffect(() => setHydrated(true), []);

	return (
		<button type="button" onClick={() => setCount(count + 1)}>
			{hydrated ? `Hydrated — this button is interactive (clicks: ${count})` : "Server-rendered HTML — not yet hydrated"}
		</button>
	);
}
