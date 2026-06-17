import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import BUTTON_CSS from "./Button.module.css";
import { Clickable, type ClickableProps } from "./Clickable.js";

/**
 * Styling variants for a `Button`, combining flex, color, status, and typography options with button-specific toggles.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Button/ButtonVariants
 */
export interface ButtonVariants extends FlexVariants, ColorVariants, StatusVariants, TypographyVariants {
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
}

/**
 * Get the full combined `className` string for a button from its styling variants.
 *
 * @param variants The button styling variants (flex, color, status, typography, plus button toggles).
 * @returns A space-separated `className` string combining all the resolved variant classes.
 * @example getButtonClass({ color: "primary", small: true }) // "button …"
 * @see https://dhoulb.github.io/shelving/ui/form/Button/getButtonClass
 */
export function getButtonClass(variants: ButtonVariants): string {
	return getClass(
		getModuleClass(BUTTON_CSS, "button", variants),
		getFlexClass(variants),
		getStatusClass(variants),
		getColorClass(variants),
		getTypographyClass(variants),
	);
}

interface ButtonProps extends ButtonVariants, ClickableProps {}

/**
 * Render either a `<button>` or an `<a href="">` styled as a button, based on whether an `onClick` or `href` prop is provided.
 * - Content-width by default (never grows); it won't shrink below its label. Pass `full` to fill the available width.
 * - Accepts all `ButtonVariants` styling props plus the [`ClickableProps`](/ui/ClickableProps) (`onClick`, `href`, `disabled`, etc.).
 *
 * @kind component
 * @example <Button onClick={save} color="primary">Save</Button>
 * @example <Button href="/about">About</Button>
 * @see https://dhoulb.github.io/shelving/ui/form/Button/Button
 */
export function Button(props: ButtonProps): ReactElement {
	return <Clickable {...props} className={getButtonClass(props)} />;
}
