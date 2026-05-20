import type { ReactElement } from "react";
import { notNullish } from "../../util/null.js";
import { Clickable, type ClickableProps } from "./Clickable.js";
import { FLEX_BUTTON_INPUT_CLASS, type InputProps, PLACEHOLDER_ELEMENTS_BUTTON_INPUT_CLASS } from "./Input.js";

export interface ButtonInputProps extends InputProps, ClickableProps {}

/** Return either a `<button>` or an `<a href="">` styled as an input, based on whether an `onClick` or `href` prop is provided. */
export function ButtonInput({ title, placeholder, children = title, ...props }: ButtonInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<Clickable {...props} className={hasChildren ? FLEX_BUTTON_INPUT_CLASS : PLACEHOLDER_ELEMENTS_BUTTON_INPUT_CLASS}>
			{hasChildren ? children : placeholder}
		</Clickable>
	);
}
