import type { ReactElement } from "react";
import { notNullish } from "../../util/index.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import { getInputClass, type InputProps, type InputVariants } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

/**
 * Props for `OutputInput`, a read-only `<output>` styled to match form inputs.
 *
 * @see https://shelving.cc/ui/OutputInputProps
 */
export interface OutputInputProps extends InputProps, OptionalChildProps, FlexVariants, InputVariants {}

/**
 * Show static read-only content styled as an input, falling back to `placeholder` when empty.
 *
 * @returns An `<output>` element styled like an input.
 * @kind component
 * @example <OutputInput title="Status">Active</OutputInput>
 * @see https://shelving.cc/ui/OutputInput
 */
export function OutputInput({ title, placeholder, children = title, ...props }: OutputInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<output
			{...props}
			className={getClass(getInputClass(props), getFlexClass(props), hasChildren && getModuleClass(INPUT_CSS, "placeholder"))}
		>
			{hasChildren ? children : placeholder}
		</output>
	);
}
