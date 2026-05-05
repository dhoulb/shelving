import type { ReactElement } from "react";
import { notNullish } from "shelving";
import { type ClickableProps, getClickable } from "./Clickable.js";
import { ELEMENTS_BUTTON_INPUT_CLASS, type InputProps, PLACEHOLDER_ELEMENTS_BUTTON_INPUT_CLASS } from "./Input.js";

export interface ButtonInputProps extends InputProps, ClickableProps {}

/** Return either a `<button>` or an `<a href="">` styled as an input, based on whether an `onClick` or `href` prop is provided. */
export function ButtonInput({
	// name,
	title,
	placeholder,
	disabled,
	href,
	onClick,
	target,
	// message = "",
	download,
	children = title,
}: ButtonInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return getClickable(
		{
			disabled,
			href,
			onClick,
			target,
			download,
			children: hasChildren ? children : placeholder,
		},
		hasChildren ? ELEMENTS_BUTTON_INPUT_CLASS : PLACEHOLDER_ELEMENTS_BUTTON_INPUT_CLASS,
	);
}
