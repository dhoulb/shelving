import { URLStore } from "../../store/URLStore.js";
import { type PossibleURL, requireURL } from "../../util/url.js";

/**
 * Store holding the current navigation URL and driving browser history.
 *
 * - Extends `URLStore`; the current location is its `value`.
 * - `forward()` pushes a new history entry; `redirect()` replaces the current one.
 * - TODO: switch to the browser Navigation API when broadly supported.
 *
 * @example const nav = new NavigationStore("/"); nav.forward("/home");
 * @see https://dhoulb.github.io/shelving/ui/router/NavigationStore/NavigationStore
 */
export class NavigationStore extends URLStore {
	/**
	 * Create a new `NavigationStore`.
	 *
	 * @param url The initial URL (defaults to `"/"`).
	 * @param base Optional base URL that relative navigations resolve against.
	 */
	constructor(url: PossibleURL = "/", base?: PossibleURL) {
		super(url, base);
	}

	/**
	 * Navigate forward to a URL, pushing a new browser history entry.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.forward("/settings");
	 * @see https://dhoulb.github.io/shelving/ui/router/NavigationStore/NavigationStore/forward
	 */
	forward(possible: PossibleURL): void {
		this.value = requireURL(possible, this.base, this.forward);
		window.history.pushState(null, "", this.value);
	}

	/**
	 * Redirect to a URL, replacing the current browser history entry.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.redirect("/login");
	 * @see https://dhoulb.github.io/shelving/ui/router/NavigationStore/NavigationStore/redirect
	 */
	redirect(possible: PossibleURL): void {
		this.value = requireURL(possible, this.base, this.redirect);
		window.history.replaceState(null, "", this.value);
	}
}
