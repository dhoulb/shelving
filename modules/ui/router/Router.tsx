import { Fragment, type ReactElement, type ReactNode, useEffect } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import { getURIParams } from "../../util/uri.js";
import { Meta, requireMeta } from "../misc/Meta.js";
import { RouterContext, requireRouter } from "./RouterContext.js";
import { RouterStore } from "./RouterStore.js";
import type { Routes } from "./Routes.js";

export interface RouterProps {
	readonly routes: Routes;
	readonly children?: ReactNode | undefined;
}

/**
 * Provides Router based on the browser URL and renders the active route.
 * - Creates a new `RouterStore`
 * - Exposes it via `requireRouter()` to descendants.
 * - Renders the route matched for the current path.
 * - Intercepts same-origin anchor clicks (excluding anchors with a `download` attribute) to perform client-side routing.
 * - Synchronizes store state with browser back/forward (`popstate`) events.
 *
 * Integrated with meta via the current `Meta`
 * - Set `url` in a wrapper component to set the initial URL for this router, e.g. `<App url="/a/b/c">`
 * - Set `base` , e.g. `<App base="https://p.com/subdir" />`
 *
 * @param routes - Route definitions used to select and render the active route
 * @param children - Content to render inside the Router Meta; defaults to the routing output component
 * @returns The Router provider element rendering the active route and supplying Router context
 */
export function Router({ routes, children = <RouterOutput /> }: RouterProps): ReactElement {
	const { url, base } = requireMeta();
	const nav = useInstance(RouterStore, routes, url, base);
	useStore(nav);

	// Effect to attach listeners when this router is active.
	useEffect(() => {
		if (typeof document === "undefined" || typeof window === "undefined") return;

		// Listen for `click` events on `<a href="">` anchors and fire the forward event instead.
		const onClick = (e: MouseEvent) => {
			// Look for clicks on `<a href="">` elements or `.targeted` elements containing `<a href="" class="target">`
			if (e.target instanceof Element) {
				const anchor =
					e.target.closest("a") ||
					(!e.target.closest("button, label") && e.target.closest(".targeted")?.querySelector<HTMLAnchorElement>("a.target[href]"));
				if (anchor instanceof HTMLAnchorElement && anchor.origin === window.location.origin && !anchor.hasAttribute("download")) {
					e.preventDefault();
					nav.forward(anchor.href);
					return false;
				} // Return false stops iOS web app opening every link in a new windows.
			}
		};
		document.addEventListener("click", onClick);

		// Listen for `popstate` events and update the currently active path.
		const onPopState = () => (nav.value = window.location.href);
		window.addEventListener("popstate", onPopState);

		return () => {
			document.removeEventListener("click", onClick);
			window.removeEventListener("popstate", onPopState);
		};
	}, [nav]);

	return (
		<RouterContext value={nav}>
			<Meta key={nav.pathname} url={nav.pathname} params={getURIParams(nav.value)}>
				{children}
			</Meta>
		</RouterContext>
	);
}

export interface RouterIsolateProps {
	children: ReactNode;
}

/**
 * Isolate a set of children so they remount on Router.
 * - Use this when you want to ensure an entire React tree is remounted when the Router route changes.
 */
export function RouterIsolate({ children }: RouterIsolateProps): ReactElement {
	const nav = useStore(requireRouter());

	// Use `key=""` prop to remount entire child tree whenever the router value changes.
	return <Fragment key={nav.href}>{children}</Fragment>;
}

/** Show the content active for the current router route. */
export function RouterOutput(): ReactElement | null {
	return useStore(requireRouter()).match();
}
