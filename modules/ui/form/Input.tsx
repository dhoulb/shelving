import type { ReactElement } from "react";
import { LOADING } from "../misc/Loading.js";
import { getClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import { FLEX_CSS } from "../variant/Flex.js";
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
export const FLEX_INPUT_CLASS = getClass(INPUT_CSS.input, FLEX_CSS.elements, FLEX_CSS.center);
export const FLEX_BUTTON_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.button, FLEX_CSS.elements, FLEX_CSS.center);
export const PLACEHOLDER_ELEMENTS_BUTTON_INPUT_CLASS = getClass(FLEX_BUTTON_INPUT_CLASS, INPUT_CSS.placeholder);
export const FLEX_LABEL_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.label, FLEX_CSS.elements, FLEX_CSS.left);
export const PLACEHOLDER_FLEX_LABEL_INPUT_CLASS = getClass(FLEX_LABEL_INPUT_CLASS, INPUT_CSS.placeholder);
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

/** Input that is loading. */
export const LOADING_INPUT = <div className={FLEX_INPUT_CLASS}>{LOADING}</div>;

/**
 * Wraps an input with support for absolutely-positioned `data-slot` icon elements on either side.
 * - This is so you can put an icon before or after an input.
 */
export function InputWrapper({ children }: ChildProps): ReactElement {
	return <div className={WRAPPER_INPUT_CLASS}>{children}</div>;
}
