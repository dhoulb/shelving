import type { ReactNode } from "react";
import { type MarkupOptions, MarkupParser } from "../../markup/MarkupParser.js";
import { requireMeta } from "./MetaContext.js";

/**
 * Props for `<Markup>` — extends `MarkupOptions` so callers can override `rules`, `rel`, `url`, `root`, or `schemes` directly.
 *
 * @see https://shelving.cc/ui/MarkupProps
 */
export interface MarkupProps extends Partial<MarkupOptions> {
	/** The source string to parse and render. */
	children?: string | undefined;
}

/**
 * Parse a markup string and render the resulting elements inline.
 * - Defaults to `MARKUP_OPTIONS` (full block + inline rule set). Pass `rules`, `rel`, `url`, `root`, or `schemes` as props to override.
 * - `url`/`root` default to the current `<Meta>` context so link rules resolve site-absolute and relative hrefs.
 * - Renders inside whatever ancestor element the caller provides — wrap in `<Prose>` to get the standard prose typography for the produced `<p>` / `<ul>` / `<pre>` / etc.
 *
 * @param children The source markup string to parse and render (renders `null` when empty).
 * @returns The parsed markup as React nodes, or `null` when `children` is empty.
 * @kind component
 * @see https://shelving.cc/ui/Markup
 */
export function Markup({ children, ...options }: MarkupProps): ReactNode {
	if (!children) return null;

	// Thread the current page URL + site root from `<Meta>` so link rules can resolve site-absolute and relative hrefs.
	const { url, root } = requireMeta();

	// Return the parsed markup.
	return new MarkupParser({ url, root, ...options }).parse(children);
}
