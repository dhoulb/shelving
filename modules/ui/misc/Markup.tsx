import type { ReactNode } from "react";
import { MarkupParser } from "../../markup/MarkupParser.js";
import type { MarkupOptions } from "../../markup/util/options.js";
import { requireMeta } from "./MetaContext.js";

/** Props for `<Markup>` — extends `MarkupOptions` so callers can override `rules`, `rel`, `url`, `root`, or `schemes` directly. */
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
 * @example <Prose><Markup>{`A *bold* word with \`code\`.`}</Markup></Prose>
 */
export function Markup({ children, ...options }: MarkupProps): ReactNode {
	if (!children) return null;

	// Thread the current page URL + site root from `<Meta>` so link rules can resolve site-absolute and relative hrefs.
	const { url, root } = requireMeta();

	// Return the parsed markup.
	return new MarkupParser({ url, root, ...options }).parse(children);
}
