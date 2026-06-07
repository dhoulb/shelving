import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getStatusClass, type Status } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import BUTTON_CSS from "./Button.module.css";
import { Clickable, type ClickableProps } from "./Clickable.js";

/** Variants for buttons. */
export interface ButtonVariants extends FlexVariants, ColorVariants {
	/** This is the default button in a form and should be displayed stronger. */
	strong?: boolean | undefined;
	/** Add plain styling (background only appears on hover or focus). */
	plain?: boolean | undefined;
	/** Add outline styling (has no background until hover or focus). */
	outline?: boolean | undefined;
	/** Make the button appear smaller. */
	small?: boolean | undefined;
	/** Fill the available width instead of sizing to content (buttons are content-width by default). */
	full?: boolean | undefined;
	/** Status colour for the button (e.g. `status="success"`). */
	status?: Status | undefined;
}

interface ButtonProps extends ButtonVariants, ClickableProps {}

/**
 * Return either a `<button>` or an `<a href="">` styled as an button, based on whether an `onClick` or `href` prop is provided.
 * - Content-width by default (never grows); it won't shrink below its label. Pass `full` to fill the available width.
 */
export function Button(props: ButtonProps): ReactElement {
	return <Clickable {...props} className={getButtonClass(props)} />;
}

/** Get the full className for a button. */
export function getButtonClass({ status, ...variants }: ButtonVariants): string {
	return getClass(
		getModuleClass(BUTTON_CSS, "button", variants),
		getFlexClass(variants),
		status && getStatusClass(status),
		getColorClass(variants),
	);
}
