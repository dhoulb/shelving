import type { ReactElement } from "react";
import { ELEMENTS_CSS, type ElementsVariants } from "../block/Elements.js";
import { getStatusClass, type StatusVariants } from "../notice/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import BUTTON_CSS from "./Button.module.css";
import { type ClickableProps, getClickable } from "./Clickable.js";

/** Variants for buttons. */
export interface ButtonVariants extends ElementsVariants, StatusVariants {
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

// Precomposed styles.
export const ELEMENTS_BUTTON_CLASS = getClass(BUTTON_CSS.button, ELEMENTS_CSS.elements, ELEMENTS_CSS.center);

interface ButtonProps extends ButtonVariants, ClickableProps {}

/** Return either a `<button>` or an `<a href="">` styled as an button, based on whether an `onClick` or `href` prop is provided. */
export function Button({ disabled, href, onClick, title, target, download, children, ...variants }: ButtonProps): ReactElement {
	return getClickable(
		{
			disabled,
			href,
			onClick,
			title,
			target,
			download,
			children,
		},
		getClass(
			ELEMENTS_BUTTON_CLASS, //
			getModuleClass(BUTTON_CSS, variants),
			getModuleClass(ELEMENTS_CSS, variants),
			getStatusClass(variants), // Buttons have status colours.
		),
	);
}

export { BUTTON_CSS };
