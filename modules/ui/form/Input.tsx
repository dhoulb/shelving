import type { ReactElement, ReactNode } from "react";
import { ELEMENTS_CSS } from "../block/Elements.js";
import { LOADING } from "../misc/Loading.js";
import { getClass } from "../util/css.js";
import { type ClickableProps, getClickable } from "./Clickable.js";
import INPUT_CSS from "./Input.module.css";

// Precomposed classes.
export const RADIO_CLASS = INPUT_CSS.radio;
export const CHECKBOX_CLASS = INPUT_CSS.radio;
export const PLACEHOLDER_CLASS = INPUT_CSS.placeholder;
export const INPUT_CLASS = INPUT_CSS.input;
export const TEXT_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.text);
export const MULTILINE_TEXT_INPUT_CLASS = getClass(TEXT_INPUT_CLASS, INPUT_CSS.multiline);
export const SELECT_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.select);
export const EMPTY_OPTION_INPUT_CLASS = INPUT_CSS.empty;
export const VALUE_OPTION_INPUT_CLASS = INPUT_CSS.value;
export const ELEMENTS_INPUT_CLASS = getClass(INPUT_CSS.input, ELEMENTS_CSS.elements, ELEMENTS_CSS.center);
export const ELEMENTS_BUTTON_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.button, ELEMENTS_CSS.elements, ELEMENTS_CSS.center);
export const PLACEHOLDER_ELEMENTS_BUTTON_INPUT_CLASS = getClass(ELEMENTS_BUTTON_INPUT_CLASS, INPUT_CSS.placeholder);
export const ELEMENTS_LABEL_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.label, ELEMENTS_CSS.elements, ELEMENTS_CSS.left);
export const PLACEHOLDER_ELEMENTS_LABEL_INPUT_CLASS = getClass(ELEMENTS_LABEL_INPUT_CLASS, INPUT_CSS.placeholder);
export const WRAPPER_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.wrapper);

/** Props all inputs allow. */
export interface InputProps {
	/** The `name=""` prop of the input. */
	name: string;
	/** Friendly title for the input. */
	title?: string | undefined;
	/** Placeholder for the input. Defaults to `title`. Set to `""` to show no placeholder. */
	placeholder?: string | undefined;
	/** Whether the input is required. */
	required?: boolean | undefined;
	/** Whether the input is disabled. */
	disabled?: boolean | undefined;
	/** Any error message for the input. */
	message?: string | undefined;
}

/** "Value inputs" are inputs that generate a value, like `<input>` or `<textarea>` */
export interface ValueInputProps<O, I = never> extends InputProps {
	/** The current value of the input. */
	value?: O | I | undefined;
	/** Called when the value for the input changes, so you can make changes based on the new value (or `undefined` to set back to default). */
	onValue(value: O | undefined): void;
}

/** Return either a `<button>` or an `<a href="">` styled as an input, based on whether an `onClick` or `href` prop is provided. */
export function Input({
	// name,
	title,
	placeholder = title,
	// message,
	disabled,
	href,
	onClick,
	target,
	download,
	children,
}: InputProps & ClickableProps): ReactElement {
	return getClickable(
		{
			disabled,
			href,
			onClick,
			target,
			download,
			children: children || placeholder,
		},
		getClass(INPUT_CSS.input, INPUT_CSS.button, children ? undefined : INPUT_CSS.placeholder),
	);
}

/** Input that is loading. */
export const LOADING_INPUT = <div className={ELEMENTS_INPUT_CLASS}>{LOADING}</div>;

/** Wraps an input with support for absolutely-positioned `data-slot` icon elements on either side. */
export function InputWrapper({ children }: { children: ReactNode }): ReactElement {
	return <div className={WRAPPER_INPUT_CLASS}>{children}</div>;
}
