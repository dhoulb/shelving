import type { ReactElement } from "react";
import { notNullish } from "../../util/index.js";
import type { OptionalChildProps } from "../util/props.js";
import { FLEX_BUTTON_INPUT_CLASS, type InputProps, PLACEHOLDER_ELEMENTS_BUTTON_INPUT_CLASS } from "./Input.js";

export interface OutputInputProps extends InputProps, OptionalChildProps {}

/** Return static "output" styled as an input, based on whether an `onClick` or `href` prop is provided. */
export function OutputInput({ title, placeholder, children = title, ...props }: OutputInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<output {...props} className={hasChildren ? FLEX_BUTTON_INPUT_CLASS : PLACEHOLDER_ELEMENTS_BUTTON_INPUT_CLASS}>
			{hasChildren ? children : placeholder}
		</output>
	);
}
