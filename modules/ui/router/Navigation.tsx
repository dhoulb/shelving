import { type ReactElement, startTransition, useEffect, useState } from "react";
import { useInstance } from "../../react/useInstance.js";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import { setTransitionType, type TransitionType } from "../transition/util.js";
import { mergeMeta, type PossibleMeta } from "../util/index.js";
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
 * - Publishes the live URL into the `Meta` context via `mergeMeta()`, so descendant `<Router>`s re-render on navigation and merge invariants hold (e.g. `root` defaults to the live URL's origin when unset).
 * - Publishes each URL change inside `startTransition()` with a `"forward"` or `"back"` transition type, so a `<Transition>` around the routes runs a view transition.
 * - Skips the transition when the browser already animated the change (`PopStateEvent.hasUAVisualTransition`, e.g. a swipe-back gesture).
 *
 * Exactly one `<Navigation>` per app — nested routers share this single store.
 *
 * TODO: switch click/popstate handling to the browser Navigation API when broadly supported.
 *
 * @kind component
 * @see https://shelving.cc/ui/Navigation
 */
export function Navigation({ children, ...meta }: NavigationProps): ReactElement {
	const current = requireMeta(meta);
	const nav = useInstance(NavigationStore, current.url, current.root);

	// React runs a `<ViewTransition>` only for a transition update, and `useSyncExternalStore()` always renders a sync update.
	// So keep the published URL in state and copy each store change into it inside `startTransition()`.
	const [url, setURL] = useState(nav.value);

	useEffect(() => {
		if (typeof document === "undefined" || typeof window === "undefined") return;

		// Type of the next transition: `"back"` for a `popstate`, else `"forward"` (link click, `forward()`, `redirect()`).
		// `null` means no transition, because the browser already animated the change (e.g. a swipe-back gesture).
		let type: TransitionType | null = "forward";
		const stop = nav.subscribe(value => {
			const t = type;
			type = "forward";
			if (!t) return setURL(value);
			// React renders a transition that starts inside a `popstate` event as a sync update with no view transition, so leave the event first.
			setTimeout(() =>
				startTransition(() => {
					setTransitionType(t);
					setURL(value);
				}),
			);
		});

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
		const onPopState = (e: PopStateEvent) => {
			const href = window.location.href;
			if (href !== nav.value.href) type = e.hasUAVisualTransition ? null : "back";
			nav.value = href;
		};

		document.addEventListener("click", onClick);
		window.addEventListener("popstate", onPopState);

		return () => {
			document.removeEventListener("click", onClick);
			window.removeEventListener("popstate", onPopState);
			stop();
		};
	}, [nav]);

	return (
		<NavigationContext value={nav}>
			<MetaContext value={mergeMeta(current, { url }, Navigation)}>{children}</MetaContext>
		</NavigationContext>
	);
}
