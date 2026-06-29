import type { ReactElement } from "react";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import type { OptionalChildProps } from "../util/props.js";

/**
 * Props for `Span` — colour and typography variants, plus optional `children`.
 *
 * @see https://shelving.cc/ui/SpanProps
 */
export interface SpanProps extends OptionalChildProps, TypographyVariants {}

/**
 * Styled inline text — renders a `<span>` carrying only the colour and typography variant classes, with no styling of its own.
 * - Reach for it to apply variants (`size`, `weight`, `tint`, `color`, …) to a run of text that has no semantic meaning of its own.
 *
 * @kind component
 * @example <Span weight="strong" tint="30">label</Span>
 * @see https://shelving.cc/ui/Span
 */
export function Span({ children, ...props }: SpanProps): ReactElement {
	return <span className={getTypographyClass(props)}>{children}</span>;
}
