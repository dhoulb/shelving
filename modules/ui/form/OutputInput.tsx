import type { ReactElement } from "react";
import { notNullish } from "../../util/index.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import { INPUT_CLASS, type InputProps, PLACEHOLDER_CLASS } from "./Input.js";

export interface OutputInputProps extends InputProps, OptionalChildProps, FlexVariants {}

/** Return static "output" styled as an input, based on whether an `onClick` or `href` prop is provided. */
export function OutputInput({ title, placeholder, children = title, ...props }: OutputInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<output {...props} className={getClass(INPUT_CLASS, getFlexClass(props), hasChildren && PLACEHOLDER_CLASS)}>
			<span data-slot="label">{hasChildren ? children : placeholder}</span>
		</output>
	);
}
