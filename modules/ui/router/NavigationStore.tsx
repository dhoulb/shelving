import { URLStore } from "../../store/URLStore.js";
import { type PossibleURL, requireURL } from "../../util/url.js";
import type { TransitionType } from "../transition/util.js";

/**
 * Store holding the current navigation URL and driving browser history.
 *
 * - Extends `URLStore`; the current location is its `value`.
 * - `forward()` pushes a new history entry; `redirect()` replaces the current one.
 * - `back()` pushes a new history entry like `forward()`, but `<Navigation>` animates it as a back transition.
 * - TODO: switch to the browser Navigation API when broadly supported.
 *
 * @see https://shelving.cc/ui/NavigationStore
 */
export class NavigationStore extends URLStore {
	/** Transition type of the next URL change. `null` means no transition. `<Navigation>` reads it, then sets it back to `"forward"`. */
	transition: TransitionType | null = "forward";

	constructor(url: PossibleURL = typeof window === "undefined" ? "/" : window.location.href, base?: PossibleURL) {
		super(url, base);
	}

	/**
	 * Navigate forward to a URL, pushing a new browser history entry.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.forward("/settings");
	 * @see https://shelving.cc/ui/NavigationStore/forward
	 */
	forward(possible: PossibleURL): void {
		this.transition = "forward";
		this.value = requireURL(possible, this.base, this.forward);
		window.history.pushState(null, "", this.value);
	}

	/**
	 * Redirect to a URL, replacing the current browser history entry.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.redirect("/login");
	 * @see https://shelving.cc/ui/NavigationStore/redirect
	 */
	redirect(possible: PossibleURL): void {
		this.transition = "forward";
		this.value = requireURL(possible, this.base, this.redirect);
		window.history.replaceState(null, "", this.value);
	}

	/**
	 * Navigate back to a URL, pushing a new browser history entry with the `"back"` transition type.
	 * - Use it for a "back to" link, so the page slides back, not forward.
	 * - It does not go back in the browser history, so it also works when the page was opened directly.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.back("/profile");
	 * @see https://shelving.cc/ui/NavigationStore/back
	 */
	back(possible: PossibleURL): void {
		this.transition = "back";
		this.value = requireURL(possible, this.base, this.back);
		window.history.pushState(null, "", this.value);
	}
}
