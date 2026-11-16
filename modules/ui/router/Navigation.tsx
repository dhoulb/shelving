import { type ReactElement, startTransition, useEffect, useState } from "react";
import { useInstance } from "../../react/useInstance.js";
import type { AbsolutePath } from "../../util/path.js";
import type { ImmutableURL } from "../../util/url.js";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import { setTransitionType } from "../transition/util.js";
import { mergeMeta, type PossibleMeta } from "../util/index.js";
import type { OptionalChildProps } from "../util/props.js";
import { NavigationContext, NavigationPositionContext } from "./NavigationContext.js";
import { type NavigationPosition, NavigationStore } from "./NavigationStore.js";

/**
 * Props for `<Navigation>`: the initial `Meta` (url and root), the `stacks`, and optional `children`.
 *
 * @see https://shelving.cc/ui/NavigationProps
 */
export interface NavigationProps extends PossibleMeta, OptionalChildProps {
	/**
	 * Root path of each stack, in tab order, for an app with a tab bar (for example `["/home", "/discover", "/profile"]`).
	 * - Each stack keeps its own pages, so each tab remembers where you left it, and a back button goes back within its tab.
	 * - With no stacks, the app has one stack at `"/"`, and `stack` in `Meta` is `"/"`.
	 */
	readonly stacks?: readonly AbsolutePath[] | undefined;
}

/** What `<Navigation>` publishes on each change. */
interface _Published {
	readonly url: ImmutableURL;
	readonly stack: AbsolutePath;
	readonly position: NavigationPosition | undefined;
}

/**
 * Top-level navigation provider, with one stack of pages for each tab.
 * - Owns a single `NavigationStore` made from the surrounding `<Meta>` url and root.
 * - Turns clicks on same-origin links into `NavigationStore.forward()`, or `NavigationStore.back()` for a link with `className="back"`, or `NavigationStore.replace()` for a link with `className="replace"`. Clicks with a modifier key, or on links with `download` or a `target`, are left to the browser.
 * - Publishes the URL and the current `stack` into `Meta`, and the position in the stacks into `NavigationPositionContext`, all in one render.
 * - Publishes each change inside `startTransition()` with a `"forward"` or `"back"` transition type, so a `<Transition>` around the routes runs a view transition. A replace, or a change the browser already animated (for example a swipe-back), has no transition.
 * - Uses the browser Navigation API. Without it (older browsers, server renders) there are no stacks and no transitions.
 *
 * Exactly one `<Navigation>` per app. Nested routers share its store.
 *
 * @kind component
 * @see https://shelving.cc/ui/Navigation
 */
export function Navigation({ children, stacks = [], ...meta }: NavigationProps): ReactElement {
	const current = requireMeta(meta);
	const nav = useInstance(NavigationStore, current.url, current.root, ...stacks);

	// React runs a `<ViewTransition>` only for a transition update, and `useSyncExternalStore()` always renders a sync update.
	// So keep the published values in state, and copy each store change into it inside `startTransition()`.
	const [published, setPublished] = useState<_Published>(() => _getPublished(nav));

	useEffect(() => {
		const stopListening = nav.listen();

		// Publish the latest values once for each change, even when the URL and the stack both change.
		let last = nav.value.href;
		let lastStack = nav.stack.value;
		let pending = false;
		const publish = () => {
			const { value, transition } = nav;
			if (value.href === last && nav.stack.value === lastStack) return;
			last = value.href;
			lastStack = nav.stack.value;
			if (pending) return;
			pending = true;
			if (!transition) {
				pending = false;
				return setPublished(_getPublished(nav));
			}
			// React renders a transition that starts inside a browser history event as a sync update with no view transition, so leave the event first.
			setTimeout(() => {
				pending = false;
				startTransition(() => {
					setTransitionType(transition);
					setPublished(_getPublished(nav));
				});
			});
		};
		const stopURL = nav.subscribe(publish);
		const stopStack = nav.stack.subscribe(publish);

		// The first render may have run before the store saw the current history entry.
		setPublished(p => (p.url.href === nav.value.href && p.stack === nav.stack.value ? p : _getPublished(nav)));

		const onClick = (e: MouseEvent) => {
			if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !(e.target instanceof Element))
				return;
			const anchor =
				e.target.closest("a") ||
				(!e.target.closest("button, label") && e.target.closest(".targeted")?.querySelector<HTMLAnchorElement>("a.target[href]"));
			if (!(anchor instanceof HTMLAnchorElement) || anchor.origin !== window.location.origin) return;
			if (anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
			e.preventDefault();
			const { classList, href } = anchor;
			if (classList.contains("back")) nav.back(href);
			else if (classList.contains("replace")) nav.replace(href);
			else nav.forward(href);
			return false; // `return false` stops iOS web app opening every link in a new window.
		};
		document.addEventListener("click", onClick);

		return () => {
			document.removeEventListener("click", onClick);
			stopURL();
			stopStack();
			stopListening();
		};
	}, [nav]);

	const { url, stack, position } = published;
	return (
		<NavigationContext value={nav}>
			<NavigationPositionContext value={position}>
				<MetaContext value={mergeMeta(current, { url, stack }, Navigation)}>{children}</MetaContext>
			</NavigationPositionContext>
		</NavigationContext>
	);
}

function _getPublished(nav: NavigationStore): _Published {
	return { url: nav.value, stack: nav.stack.value, position: nav.position };
}
