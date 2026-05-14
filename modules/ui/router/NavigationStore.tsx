import { URLStore } from "../../store/URLStore.js";
import { type PossibleURL, requireURL } from "../../util/url.js";

/**
 * Store the current navigation state (URL only).
 * - TODO: switch to the browser Navigation API when broadly supported.
 */
export class NavigationStore extends URLStore {
	constructor(url: PossibleURL = "/", base?: PossibleURL) {
		super(url, base);
	}

	forward(possible: PossibleURL): void {
		this.value = requireURL(possible, this.base, this.forward);
		window.history.pushState(null, "", this.value);
	}

	redirect(possible: PossibleURL): void {
		this.value = requireURL(possible, this.base, this.redirect);
		window.history.replaceState(null, "", this.value);
	}
}
