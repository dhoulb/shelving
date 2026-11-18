import { useRef } from "react";
import { requireURL } from "../../util/url.js";
import { requireMeta } from "../misc/MetaContext.js";
import { useSwipe } from "../transition/useSwipe.js";
import { waitForKeyboard } from "../util/keyboard.js";
import { requireNavigation } from "./NavigationContext.js";
import type { NavigationEvent } from "./NavigationSequence.js";

/** How far from the left edge of the screen a swipe can start, in pixels. */
const _EDGE = 24;

/**
 * Swipe from the left edge of the screen to go back one page in the current stack, by scrubbing the normal back slide.
 *
 * - It renders nothing. Put it inside `<Navigation>`, next to the pages.
 * - When the swipe starts, it lowers the on-screen keyboard (`waitForKeyboard()`), then publishes the page below as a `"back"` event with `NavigationSequence.publish()`. History does not change. `<Navigation>` shows that page in a back transition, and `useSwipe()` scrubs it.
 * - On release it plays the slide to the end and calls `NavigationSequence.back()`, which publishes the same page again (skipped, so no second slide). Or it plays the slide back and publishes the page it started on again. A cancelled swipe never changes the URL.
 * - On the bottom page of a stack, or on a floating page, it does nothing, so it never goes back into another tab.
 * - It ignores touches in a `<nav>` and in dialogs.
 *
 * @kind component
 * @see https://shelving.cc/ui/BackSwipe
 */
export function BackSwipe(): null {
	const nav = requireNavigation();
	const meta = requireMeta();
	const metaRef = useRef(meta);
	metaRef.current = meta;
	const swipeRef = useRef<{ from: NavigationEvent; parent: NavigationEvent } | undefined>(undefined);

	useSwipe(document, {
		direction: "right",
		edge: _EDGE,
		ignore: "nav",
		start: () => {
			const { url, stack = null, ordinal } = metaRef.current;
			if (!url || stack === null || !ordinal) return false;
			const path = nav.history(stack)[ordinal - 1];
			if (!path) return false;
			const parent: NavigationEvent = { url: requireURL(path, url), stack, ordinal: ordinal - 1, direction: "back" };
			swipeRef.current = { from: { url, stack, ordinal }, parent };
			// Lower the keyboard before the slide starts, so the page does not resize in the middle of it.
			const waiting = waitForKeyboard();
			if (waiting)
				void waiting.then(() => {
					if (swipeRef.current?.parent === parent) void nav.publish(parent);
				});
			else void nav.publish(parent);
		},
		cancel: () => {
			const swipe = swipeRef.current;
			swipeRef.current = undefined;
			if (swipe) return nav.publish(swipe.from);
		},
		commit: () => {
			const swipe = swipeRef.current;
			swipeRef.current = undefined;
			if (!swipe) return;
			nav.back(swipe.parent.url);
			// If the browser did not go back, history is still on the old page: show where history is, with no slide.
			setTimeout(() => {
				if (nav.url.href !== swipe.parent.url.href) void nav.publish(nav.current());
			}, 1000);
		},
	});

	return null;
}
