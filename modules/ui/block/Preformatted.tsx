import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import type { SpaceVariants } from "../style/Space.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PREFORMATTED_CSS from "./Preformatted.module.css";

/**
 * Props for `Preformatted` — space, colour, typography, width, and padding variants plus a `wrap` toggle.
 *
 * @see https://shelving.cc/ui/PreformattedProps
 */
export interface PreformattedProps extends SpaceVariants, BlockVariants, OptionalChildProps {
	/** Enable line wrapping (default is nowrap). */
	wrap?: boolean | undefined;
}

/**
 * Preformatted block of text — rendered as `<pre>`.
 * - Lines are not wrapped by default — overflowing content scrolls horizontally within the block.
 * - Pass `wrap` to wrap long lines instead; newlines and indentation are preserved either way.
 *
 * @returns Rendered `<pre>` element.
 * @kind component
 * @example <Preformatted>{"line one\nline two"}</Preformatted>
 * @see https://shelving.cc/ui/Preformatted
 */
export function Preformatted({ children, ...variants }: PreformattedProps): ReactElement {
	return (
		<pre
			className={getClass(
				getModuleClass(PREFORMATTED_CSS, "preformatted", variants), //
				getBlockClass(variants),
			)}
		>
			{children}
		</pre>
	);
}
