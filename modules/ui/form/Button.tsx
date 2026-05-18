import type { ReactElement } from "react";
import { FLEX_CSS, type FlexVariants } from "../block/Flex.js";
import { type ColorVariants, getColorClass } from "../misc/Color.js";
import { getStatusClass, type StatusVariants } from "../misc/Status.js";
import { type Classes, getClass, getModuleClass } from "../util/css.js";
import BUTTON_CSS from "./Button.module.css";
import { type ClickableProps, getClickable } from "./Clickable.js";

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
		getButtonClass(variants),
	);
}

/** Get the full className for a button. */
export function getButtonClass(variants: ButtonVariants): string {
	return getClass(
		getModuleClass(BUTTON_CSS, "button", variants as Classes),
		getModuleClass(FLEX_CSS, "flex", "center", variants as Classes),
		getStatusClass(variants), // Buttons have status colours.
		getColorClass(variants), // Buttons can also have raw colour overrides.
	);
}
