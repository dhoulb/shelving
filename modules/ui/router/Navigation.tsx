import { Fragment, type ReactElement, type ReactNode, useEffect } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/index.js";
import { NavigationContext, requireNavigation } from "./NavigationContext.js";
import { NavigationStore } from "./NavigationStore.js";

export interface NavigationProps extends PossibleMeta {
	readonly children?: ReactNode;
}

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
 */
export function Navigation({ children, ...meta }: NavigationProps): ReactElement {
	const { url, root: base, ...merged } = requireMeta(meta);
	const nav = useInstance(NavigationStore, url, base);
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
					return false;
				} // `return false` stops iOS web app opening every link in a new window.
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
			<MetaContext value={{ root: base, url: nav.value, ...merged }}>{children}</MetaContext>
		</NavigationContext>
	);
}

export interface NavigationIsolateProps {
	children: ReactNode;
}

/**
 * Force a full remount of children whenever the navigation URL changes.
 * - Use to reset stateful sub-trees on navigation.
 */
export function NavigationIsolate({ children }: NavigationIsolateProps): ReactElement {
	const nav = useStore(requireNavigation());
	return <Fragment key={nav.href}>{children}</Fragment>;
}
