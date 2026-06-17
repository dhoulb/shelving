import type { ReactElement } from "react";
import { notNullish } from "../../util/null.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass, getModuleClass } from "../util/css.js";
import { Clickable, type ClickableProps } from "./Clickable.js";
import { getInputClass, type InputProps, type InputVariants } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

/**
 * Props for `ButtonInput`, a clickable element styled to match form inputs.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/ButtonInput/ButtonInputProps
 */
export interface ButtonInputProps extends InputProps, ClickableProps, FlexVariants, InputVariants {}

/**
 * Return either a `<button>` or an `<a href="">` styled as an input, based on whether an `onClick` or `href` prop is provided.
 * - Falls back to rendering the `placeholder` when no `children`/`title` content is supplied.
 *
 * @returns A `Clickable` element styled with the button-input class.
 * @example <ButtonInput name="choose" onClick={open}>Choose…</ButtonInput>
 * @see https://dhoulb.github.io/shelving/ui/form/ButtonInput/ButtonInput
 */
export function ButtonInput({ title, placeholder, children = title, ...props }: ButtonInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<Clickable
			{...props}
			className={getClass(
				getInputClass(props),
				getModuleClass(INPUT_CSS, "button"),
				getFlexClass(props),
				hasChildren && getModuleClass(INPUT_CSS, "placeholder"),
			)}
		>
			{hasChildren ? children : placeholder}
		</Clickable>
	);
}
