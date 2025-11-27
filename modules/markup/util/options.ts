import type { URISchemes } from "../../util/uri.js";
import type { URLString } from "../../util/url.js";
import type { MarkupRules } from "./rule.js";

/** The current parsing options (represents the current state of the parsing). */
export type MarkupOptions = {
	/** The active list of parsing rules. */
	readonly rules: MarkupRules;

	/**
	 * Set the `rel=""` property used for any links (e.g. `rel="nofollow ugc"`).
	 * @example "nofollow ugc"
	 */
	readonly rel?: string | undefined;

	/**
	 * Set the base URL that any relative URLs will be relative to
	 * @default `window.location.href` in browser environments, and `undefined` in server environments.
	 */
	readonly base?: URLString | undefined;

	/**
	 * Valid URI schemes/protocols for URLs and URIs.
	 * @example ["http:", "https:"]
	 * @default ["http:", "https:"]
	 */
	readonly schemes?: URISchemes | undefined;
};
