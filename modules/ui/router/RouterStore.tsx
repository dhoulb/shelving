import type { ReactElement } from "react";
import { URLStore } from "../../store/URLStore.js";
import { type PossibleURL, requireURL } from "../../util/url.js";
import { matchRoute, type Routes } from "./Routes.js";

/** Store the current router state. */
export class RouterStore extends URLStore {
	readonly routes: Routes;

	constructor(routes: Routes) {
		super(requireURL(window.location.href));
		this.routes = routes;
	}

	forward(possible: PossibleURL): void {
		this.value = requireURL(possible, this.base, this.forward);
		window.history.pushState(null, "", this.value);
	}

	redirect(possible: PossibleURL): void {
		this.value = requireURL(possible, this.base, this.redirect);
		window.history.replaceState(null, "", this.value);
	}

	/** Match a route against this router's routes and return the matched component. */
	match(path = this.pathname, params = this.params): ReactElement | null {
		return matchRoute(this.routes, path, params);
	}
}
