import type { MarkupRules } from "./rule.js";
import { MARKUP_RULES } from "./rules.js";

/** The current parsing options (represents the current state of the parsing). */
export type MarkupOptions = {
	/** The active list of parsing rules. */
	readonly rules: MarkupRules;
	/** The initial context to start parsing in (rules may render their children with a different context). */
	readonly context: string;
	/** Set the base URL that any relative links will be relative to (defaults to `window.location.href`, if undefined then relative links won't work). */
	readonly url: string | undefined;
	/** Set the `rel=""` property used for any links (e.g. `rel="nofollow ugc"`). */
	readonly rel: string | undefined;
	/** Valid URL schemes/protocols for links (including trailing commas), defaults to `[`http:`, `https:`]` */
	readonly schemes: string[];
};

/** Default options */
export const MARKUP_OPTIONS: MarkupOptions = {
	context: "block",
	rules: MARKUP_RULES,
	url: undefined,
	rel: undefined,
	schemes: ["http:", "https:"],
};
