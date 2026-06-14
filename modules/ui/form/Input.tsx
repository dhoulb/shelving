import type { ReactElement } from "react";
import { LOADING } from "../misc/Loading.js";
import { getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import INPUT_CSS from "./Input.module.css";

// Classes.

/**
 * `className` for a `<input type="radio">` element.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/RADIO_CLASS
 */
export const RADIO_CLASS = INPUT_CSS.radio;

/**
 * `className` for a `<input type="checkbox">` element.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/CHECKBOX_CLASS
 */
export const CHECKBOX_CLASS = INPUT_CSS.radio;

/**
 * Base `className` shared by all input elements.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/INPUT_CLASS
 */
export const INPUT_CLASS = INPUT_CSS.input;

/**
 * `className` applied to an input when it's showing placeholder content.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/PLACEHOLDER_CLASS
 */
export const PLACEHOLDER_CLASS = INPUT_CSS.placeholder;

/**
 * `className` for the empty/placeholder `<option>` of a `<select>`.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/EMPTY_OPTION_CLASS
 */
export const EMPTY_OPTION_CLASS = INPUT_CSS.empty;

/**
 * `className` for a value-bearing `<option>` of a `<select>`.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/VALUE_OPTION_CLASS
 */
export const VALUE_OPTION_CLASS = INPUT_CSS.value;

// Precomposed classes.

/**
 * Precomposed `className` for a single-line text `<input>`.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/TEXT_INPUT_CLASS
 */
export const TEXT_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.text);

/**
 * Precomposed `className` for a multiline `<textarea>`.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/MULTILINE_TEXT_INPUT_CLASS
 */
export const MULTILINE_TEXT_INPUT_CLASS = getClass(TEXT_INPUT_CLASS, INPUT_CSS.multiline);

/**
 * Precomposed `className` for an input wrapper that hosts `data-slot` icon elements.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/WRAPPER_INPUT_CLASS
 */
export const WRAPPER_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.wrapper);

/**
 * Precomposed `className` for a `<select>` input.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/SELECT_INPUT_CLASS
 */
export const SELECT_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.select);

/**
 * Precomposed `className` for a button styled as an input.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/BUTTON_INPUT_CLASS
 */
export const BUTTON_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.button);

/**
 * Precomposed `className` for a `<label>` styled as an input (e.g. checkbox/radio wrappers).
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/LABEL_INPUT_CLASS
 */
export const LABEL_INPUT_CLASS = getClass(INPUT_CSS.input, INPUT_CSS.label);

/**
 * Base props shared by every form input (name, title, placeholder, required/disabled state, and error message).
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/InputProps
 */
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
export const LOADING_INPUT = <div className={getClass(INPUT_CLASS, getFlexClass({}))}>{LOADING}</div>;

/**
 * Wraps an input with support for absolutely-positioned `data-slot` icon elements on either side.
 * - This is so you can put an icon before or after an input.
 */
export function InputWrapper({ children }: ChildProps): ReactElement {
	return <div className={WRAPPER_INPUT_CLASS}>{children}</div>;
}
