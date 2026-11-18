import { type ReactElement, useEffect, useLayoutEffect } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useSequenceTransition } from "../../react/useSequenceTransition.js";
import type { AbsolutePath } from "../../util/path.js";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import { mergeMeta, type PossibleMeta } from "../util/index.js";
import type { OptionalChildProps } from "../util/props.js";
import { NavigationContext } from "./NavigationContext.js";
import { type NavigationEvent, NavigationSequence } from "./NavigationSequence.js";

/**
 * Props for `<Navigation>`: the initial `Meta` (url, root and stack), the `stacks`, and optional `children`.
 *
 * @see https://shelving.cc/ui/NavigationProps
 */
export interface NavigationProps extends PossibleMeta, OptionalChildProps {
	/**
	 * Root path of each stack, in tab order, for an app with a tab bar (for example `["/home", "/discover", "/profile"]`).
	 * - Each stack keeps its own pages, so each tab remembers where you left it, and a back button goes back within its tab.
	 * - A page outside these stacks is floating: its stack is `null`, and no tab is selected.
	 * - With no stacks, every page floats.
	 */
	readonly stacks?: readonly AbsolutePath[] | undefined;
	/**
	 * Stack of the page the app opens at (for example `"/home"`), like `url` and `root`.
	 * - Read from this prop, else from the surrounding `<Meta>`, else `null` (floating).
	 * - Used only when the opening history entry has no saved stack. A reload keeps the stack it had.
	 */
	readonly stack?: AbsolutePath | null | undefined;
}

/**
 * Top-level navigation provider, with one stack of pages for each tab.
 * - Owns a single `NavigationSequence` made from the surrounding `<Meta>` url and root.
 * - Turns clicks on same-origin links into `NavigationSequence.forward()`, or `NavigationSequence.back()` for a link with `className="back"`, or `NavigationSequence.replace()` for a link with `className="replace"`. Clicks with a modifier key, or on links with `download` or a `target`, are left to the browser.
 * - Holds the page it shows in its own state, and publishes its `url`, `stack` and `ordinal` into `Meta`. Read the current page from `Meta`.
 * - Each move lowers the on-screen keyboard before it changes the history: see `NavigationSequence.forward()`.
 * - Takes each `NavigationEvent` with `useSequenceTransition()`. A move is set inside `startTransition()` with its `"forward"` or `"back"` type, so a `<Transition>` around the routes runs a view transition. A replace has no transition. An event for the page already shown is skipped.
 * - Uses the browser Navigation API. Without it (older browsers, server renders) there are no stacks and no transitions.
 *
 * Exactly one `<Navigation>` per app. Nested routers share its sequence.
 *
 * @kind component
 * @see https://shelving.cc/ui/Navigation
 */
export function Navigation({ children, stacks = [], ...meta }: NavigationProps): ReactElement {
	const current = requireMeta(meta);
	const nav = useInstance(NavigationSequence, current.url, current.root, current.stack ?? null, ...stacks);

	// Keep the page shown in state, set inside a transition for each move.
	const page = useSequenceTransition(nav, {
		current: () => nav.current(),
		transition: _getDirection,
		equal: _isSamePage,
	});

	// Tell a waiting `NavigationSequence.publish()` that its page is committed.
	useLayoutEffect(() => {
		if (page) nav.committed();
	}, [nav, page]);

	useEffect(() => {
		const stopListening = nav.listen();

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
			stopListening();
		};
	}, [nav]);

	const { url, stack, ordinal } = page;
	return (
		<NavigationContext value={nav}>
			<MetaContext value={mergeMeta(current, { url, stack, ordinal }, Navigation)}>{children}</MetaContext>
		</NavigationContext>
	);
}

function _getDirection({ direction }: NavigationEvent): string | undefined {
	return direction;
}

function _isSamePage(a: NavigationEvent, b: NavigationEvent): boolean {
	return a.url.href === b.url.href && a.stack === b.stack && a.ordinal === b.ordinal;
}
