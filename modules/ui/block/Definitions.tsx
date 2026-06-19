import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import DEFINITIONS_CSS from "./Definitions.module.css";

const DEFINITIONS_CLASS = getModuleClass(DEFINITIONS_CSS, "definitions");

/**
 * Props for `Definitions` — colour, gap, space, and typography variants plus optional children.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Definitions/DefinitionsProps
 */
export interface DefinitionsProps extends ColorVariants, GapVariants, SpaceVariants, TypographyVariants, OptionalChildProps {}

/**
 * Description list — a sequence of term/value pairs rendered as a `<dl>`.
 * - Children are raw `<dt>` / `<dd>` elements — `<dt>` is the term label, `<dd>` the value, stacked term-above-value.
 * - The spacing between pairs is overridable via the `--definitions-gap` hook.
 *
 * @kind component
 * @example <Definitions><dt>Name</dt><dd>Acme</dd></Definitions>
 * @see https://dhoulb.github.io/shelving/ui/block/Definitions/Definitions
 */
export function Definitions({ children, ...props }: DefinitionsProps): ReactElement {
	return (
		<dl
			className={getClass(
				DEFINITIONS_CLASS, //
				getColorClass(props),
				getGapClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</dl>
	);
}
