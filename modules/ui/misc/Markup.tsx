import type { ReactNode } from "react";
import { renderMarkup } from "../../markup/render.js";
import { MARKUP_OPTIONS } from "../../markup/rule/index.js";
import type { MarkupOptions } from "../../markup/util/options.js";

/** Props for `<Markup>` — extends `MarkupOptions` so callers can override `rules`, `rel`, `base`, or `schemes` directly. */
export interface MarkupProps extends Partial<MarkupOptions> {
	/** The source string to parse and render. */
	children?: string | undefined;
}

/**
 * Parse a markup string and render the resulting elements inline.
 * - Defaults to `MARKUP_OPTIONS` (full block + inline rule set). Pass `rules`, `rel`, `base`, or `schemes` as props to override.
 * - Renders inside whatever ancestor element the caller provides — wrap in `<Prose>` to get the standard prose typography for the produced `<p>` / `<ul>` / `<pre>` / etc.
 *
 * @example <Prose><Markup>{`A *bold* word with \`code\`.`}</Markup></Prose>
 */
export function Markup({ children, ...overrides }: MarkupProps): ReactNode {
	if (!children) return null;
	const options: MarkupOptions = { ...MARKUP_OPTIONS, ...overrides };
	return renderMarkup(children, options);
}
