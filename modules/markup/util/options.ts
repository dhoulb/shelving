import type { URISchemes } from "../../util/uri.js";
import type { ImmutableURL } from "../../util/url.js";
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
	 * Current page URL — used as the base for resolving relative refs (`./foo`, `#x`, bare segments) in link hrefs.
	 * @default Falls back to `root` if not set.
	 */
	readonly url?: ImmutableURL | undefined;

	/**
	 * Site root URL — used as the base for resolving site-absolute path hrefs (`/foo`), honoring its subfolder.
	 * @default Falls back to `url` if not set.
	 */
	readonly root?: ImmutableURL | undefined;

	/**
	 * Valid URI schemes/protocols for URLs and URIs.
	 * @example ["http:", "https:"]
	 * @default ["http:", "https:"]
	 */
	readonly schemes?: URISchemes | undefined;
};
