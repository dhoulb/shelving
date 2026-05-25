import type { ReactElement } from "react";
import { notNullish } from "../../util/null.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import { Clickable, type ClickableProps } from "./Clickable.js";
import { BUTTON_INPUT_CLASS, type InputProps, PLACEHOLDER_CLASS } from "./Input.js";

export interface ButtonInputProps extends InputProps, ClickableProps, FlexVariants {}

/** Return either a `<button>` or an `<a href="">` styled as an input, based on whether an `onClick` or `href` prop is provided. */
export function ButtonInput({ title, placeholder, children = title, ...props }: ButtonInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<Clickable {...props} className={getClass(BUTTON_INPUT_CLASS, getFlexClass(props), hasChildren && PLACEHOLDER_CLASS)}>
			<span data-slot="label">{hasChildren ? children : placeholder}</span>
		</Clickable>
	);
}
