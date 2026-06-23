import { getModuleClass } from "../util/css.js";
import INDENT_CSS from "./Indent.module.css";

/**
 * Allowed values for inline-padding ("indent") for components that support `IndentVariants`
 *
 * @see https://shelving.cc/ui/IndentVariant
 */
export type IndentVariant =
	| "none"
	| "xxsmall"
	| "xsmall"
	| "small"
	| "normal"
	| "large"
	| "xlarge"
	| "xxlarge"
	| "1x"
	| "2x"
	| "3x"
	| "4x"
	| "5x"
	| "6x"
	| "7x"
	| "8x"
	| "9x"
	| "10x";

/**
 * Variant props for the inline-padding ("indent", left + right) of a component, e.g. `indent="normal"`.
 *
 * @see https://shelving.cc/ui/IndentVariants
 */
export interface IndentVariants {
	/** Inline-padding (left + right) of the element, keeping its content off the edges. */
	indent?: IndentVariant | undefined;
}

/**
 * Get the inline-padding ("indent") class for a component from its `indent` variant prop.
 *
 * @param variants
 * @returns The indent class string, or `undefined` when no `indent` is set.
 * @example getIndentClass({ indent: "normal" }) // "indent-normal"
 * @see https://shelving.cc/ui/getIndentClass
 */
export function getIndentClass({ indent }: IndentVariants): string | undefined {
	return indent && getModuleClass(INDENT_CSS, `indent-${indent}`);
}
