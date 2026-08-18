import type { ReactElement } from "react";
import { getBlockClass } from "../style/Block.js";
import type { GapVariants } from "../style/Gap.js";
import type { SpaceVariants } from "../style/Space.js";
import type { TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import DEFINITIONS_CSS from "./Definitions.module.css";

const DEFINITIONS_CLASS = getModuleClass(DEFINITIONS_CSS, "definitions");

/**
 * Props for `Definitions` — colour, gap, space, and typography variants plus optional children.
 *
 * @see https://shelving.cc/ui/DefinitionsProps
 */
export interface DefinitionsProps extends GapVariants, SpaceVariants, TypographyVariants, OptionalChildProps, ClassProps {}

/**
 * Description list — a sequence of term/value pairs rendered as a `<dl>`.
 * - Children are raw `<dt>` / `<dd>` elements — `<dt>` is the term label, `<dd>` the value, stacked term-above-value.
 * - The spacing between pairs is overridable via the `--definitions-gap` hook.
 *
 * @kind component
 * @example <Definitions><dt>Name</dt><dd>Acme</dd></Definitions>
 * @see https://shelving.cc/ui/Definitions
 */
export function Definitions({ children, className, ...props }: DefinitionsProps): ReactElement {
	return (
		<dl
			className={getClass(
				DEFINITIONS_CLASS, //
				getBlockClass(props),
				className,
			)}
		>
			{children}
		</dl>
	);
}
