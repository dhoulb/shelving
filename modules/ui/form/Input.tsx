import type { ReactElement } from "react";
import { LOADING } from "../misc/Loading.js";
import { getFlexClass } from "../style/Flex.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import INPUT_CSS from "./Input.module.css";

/**
 * Styling variants shared by every form input — currently the `width` variant (`width="narrow"`, `"normal"`, `"wide"`, `"full"`, `"fit"`).
 * - Extends `WidthVariants` so any input can be sized (e.g. `<CheckboxInput width="fit">` to shrink to its content).
 * - Designed to grow: new cross-cutting input styling props (e.g. spacing) should be added here so every input picks them up consistently.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Input/InputVariants
 */
export interface InputVariants extends WidthVariants {}

/**
 * Build the shared base `className` for a form input from its styling variants — the base input class plus any `InputVariants`.
 *
 * @returns The merged base input `className` string.
 * @example getClass(getInputClass(props), getModuleClass(INPUT_CSS, "text")) // a text input that also honours width variants
 * @see https://dhoulb.github.io/shelving/ui/form/Input/getInputClass
 */
export function getInputClass(props: InputVariants): string {
	return getClass(getModuleClass(INPUT_CSS, "input"), getWidthClass(props));
}

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
export const LOADING_INPUT = <div className={getClass(getInputClass({}), getFlexClass({}))}>{LOADING}</div>;

/**
 * Wraps an input with support for absolutely-positioned `data-slot` icon elements on either side.
 * - This is so you can put an icon before or after an input.
 */
export function InputWrapper({ children }: ChildProps): ReactElement {
	return <div className={getClass(getInputClass({}), getModuleClass(INPUT_CSS, "wrapper"))}>{children}</div>;
}
