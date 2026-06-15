import type { ReactElement } from "react";
import { notNullish } from "../../util/index.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import { getInputClass, type InputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

/**
 * Props for `OutputInput`, a read-only `<output>` styled to match form inputs.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/OutputInput/OutputInputProps
 */
export interface OutputInputProps extends InputProps, OptionalChildProps, FlexVariants {}

/**
 * Show static read-only content styled as an input, falling back to `placeholder` when empty.
 *
 * @param props Props including `children`/`title` content, `placeholder`, and `Flex` variants.
 * @returns An `<output>` element styled like an input.
 * @example <OutputInput title="Status">Active</OutputInput>
 * @see https://dhoulb.github.io/shelving/ui/form/OutputInput/OutputInput
 */
export function OutputInput({ title, placeholder, children = title, ...props }: OutputInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<output {...props} className={getClass(getInputClass(), getFlexClass(props), hasChildren && INPUT_CSS.placeholder)}>
			{hasChildren ? children : placeholder}
		</output>
	);
}
