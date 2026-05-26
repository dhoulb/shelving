import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getStatusClass, type Status, type StatusVariants } from "../style/Status.js";
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
	/** Status colour for the button. Accepts a string (`status="success"`) or a boolean variant (`success`) — both forms compose the same class. */
	status?: Status | undefined;
}

interface ButtonProps extends ButtonVariants, ClickableProps {}

/** Return either a `<button>` or an `<a href="">` styled as an button, based on whether an `onClick` or `href` prop is provided. */
export function Button(props: ButtonProps): ReactElement {
	return <Clickable {...props} className={getButtonClass(props)} />;
}

/** Get the full className for a button. */
export function getButtonClass({ status, ...variants }: ButtonVariants): string {
	return getClass(
		getModuleClass(BUTTON_CSS, "button", variants),
		getFlexClass(variants),
		status && getStatusClass(status), // String form: `status="success"`.
		getStatusClass(variants), // Boolean form: `success`.
		getColorClass(variants), // Raw colour overrides.
	);
}
