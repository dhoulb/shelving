import type { MarkupRules } from "./rule.js";
import type { AbsoluteLink, LinkHosts, LinkSchemes } from "../util/link.js";
import { MARKUP_RULES } from "./rules.js";

/** The current parsing options (represents the current state of the parsing). */
export type MarkupOptions = {
	/** The active list of parsing rules. */
	readonly rules: MarkupRules;
	/** The initial context to start parsing in (rules may render their children with a different context). */
	readonly context: string;
	/** Set the `rel=""` property used for any links (e.g. `rel="nofollow ugc"`). */
	readonly rel: string | undefined;
	/** Set the base URL that any relative links will be relative to (defaults to `window.location.href`, if undefined then relative links won't work). */
	readonly base: AbsoluteLink | undefined;
	/** Valid URL schemes/protocols for links (including trailing commas), defaults to `[`http:`, `https:`]` */
	readonly schemes: LinkSchemes | undefined;
	/** Valid URL hosts for links (including trailing commas) */
	readonly hosts: LinkHosts | undefined;
};

/** Default options */
export const MARKUP_OPTIONS: MarkupOptions = {
	context: "block",
	rules: MARKUP_RULES,
	rel: undefined,
	base: undefined,
	schemes: undefined,
	hosts: undefined,
};
