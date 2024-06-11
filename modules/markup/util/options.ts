import type { AbsoluteLink, LinkHosts, LinkSchemes } from "../../util/link.js";
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
	 * Set the base URL that any relative links will be relative to
	 * @default `window.location.href` in browser environments, and `undefined` in server environments.
	 */
	readonly base?: AbsoluteLink | undefined;

	/**
	 * Valid URL schemes/protocols for links.
	 * @example ["http:", "https:"]
	 * @default ["http:", "https:"]
	 */
	readonly schemes?: LinkSchemes | undefined;

	/**
	 * Valid URL hosts for links.
	 * @example ["google.com", "www.google.com"]
	 */
	readonly hosts?: LinkHosts | undefined;
};
