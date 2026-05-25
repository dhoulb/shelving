import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import BUTTON_CSS from "./Button.module.css";
import { Clickable, type ClickableProps } from "./Clickable.js";

/** Variants for buttons. */
export interface ButtonVariants extends FlexVariants, StatusVariants, ColorVariants {
	/** This is the default button in a form and should be displayed stronger. */
	strong?: boolean | undefined;
	/** Add plain styling (background only appears on hover or focus). */
	plain?: boolean | undefined;
	/** Add outline styling (has no background until hover or focus). */
	outline?: boolean | undefined;
	/** Make the button appear smaller. */
	small?: boolean | undefined;
	/** Make the button content-width. */
	fit?: boolean | undefined;
}

interface ButtonProps extends ButtonVariants, ClickableProps {}

/** Return either a `<button>` or an `<a href="">` styled as an button, based on whether an `onClick` or `href` prop is provided. */
export function Button({ children, ...props }: ButtonProps): ReactElement {
	return (
		<Clickable {...props} className={getButtonClass(props)}>
			{children !== undefined ? <span data-slot="label">{children}</span> : undefined}
		</Clickable>
	);
}

/** Get the full className for a button. */
export function getButtonClass(variants: ButtonVariants): string {
	return getClass(
		getModuleClass(BUTTON_CSS, "button", variants),
		getFlexClass(variants),
		getStatusClass(variants), // Buttons have status colours.
		getColorClass(variants), // Buttons can also have raw colour overrides.
	);
}
