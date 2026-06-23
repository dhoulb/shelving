import { type ReactElement, useEffect } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/index.js";
import type { OptionalChildProps } from "../util/props.js";
import { NavigationContext } from "./NavigationContext.js";
import { NavigationStore } from "./NavigationStore.js";

/**
 * Props for `<Navigation>` — initial `Meta` (url/base) plus optional `children`.
 *
 * @see https://shelving.cc/ui/NavigationProps
 */
export interface NavigationProps extends PossibleMeta, OptionalChildProps {}

/**
 * Top-level navigation provider.
 * - Owns a single `NavigationStore` initialised from the surrounding `<Meta>` url/base.
 * - Intercepts same-origin anchor clicks (excluding `download` anchors) and turns them into `forward()` calls.
 * - Listens for `popstate` to sync the store with browser back/forward.
 * - Publishes the live URL via `<Meta url={…} params={…}>` so descendant `<Router>`s re-render on navigation.
 *
 * Exactly one `<Navigation>` per app — nested routers share this single store.
 *
 * TODO: switch click/popstate handling to the browser Navigation API when broadly supported.
 *
 * @kind component
 * @param children The app subtree to provide navigation to.
 * @param meta Initial meta (url/base) merged with the surrounding `<Meta>` context.
 * @returns The navigation provider wrapping `children`.
 * @example <Navigation><App /></Navigation>
 * @see https://shelving.cc/ui/Navigation
 */
export function Navigation({ children, ...meta }: NavigationProps): ReactElement {
	const { url, root, ...merged } = requireMeta(meta);
	const nav = useInstance(NavigationStore, url, root);
	useStore(nav);

	useEffect(() => {
		if (typeof document === "undefined" || typeof window === "undefined") return;

		const onClick = (e: MouseEvent) => {
			if (e.target instanceof Element) {
				const anchor =
					e.target.closest("a") ||
					(!e.target.closest("button, label") && e.target.closest(".targeted")?.querySelector<HTMLAnchorElement>("a.target[href]"));
				if (anchor instanceof HTMLAnchorElement && anchor.origin === window.location.origin && !anchor.hasAttribute("download")) {
					e.preventDefault();
					nav.forward(anchor.href);
					return false; // `return false` stops iOS web app opening every link in a new window.
				}
			}
		};
		const onPopState = () => {
			nav.value = window.location.href;
		};

		document.addEventListener("click", onClick);
		window.addEventListener("popstate", onPopState);

		return () => {
			document.removeEventListener("click", onClick);
			window.removeEventListener("popstate", onPopState);
		};
	}, [nav]);

	return (
		<NavigationContext value={nav}>
			<MetaContext value={{ url: nav.value, root, ...merged }}>{children}</MetaContext>
		</NavigationContext>
	);
}
