import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps } from "../util/props.js";
import BUTTON_CSS from "./Button.module.css";
import { Clickable, type ClickableProps } from "./Clickable.js";

/**
 * Styling variants for a `Button`: the block variants (space, padding, indent, width, typography), flex, and status, plus button-specific toggles.
 *
 * @see https://shelving.cc/ui/ButtonVariants
 */
export interface ButtonVariants extends BlockVariants, FlexVariants, StatusVariants {
	/** Solid styling: a strong fill of the tint colour with white text. Use it for the main action. */
	solid?: boolean | undefined;
	/** Plain styling: no fill or border until hover or focus. */
	plain?: boolean | undefined;
	/** Outline styling: like `plain`, but with a border until hover or focus. */
	outline?: boolean | undefined;
	/**
	 * Whether the button is the selected one in a group, such as a set of tabs.
	 * - `true` sets `aria-pressed` (or `aria-current` on a link) and keeps the button's normal look.
	 * - `false` also drops the fill until hover or focus, so the selected button stands out.
	 * - `undefined` (the default) means the button is not part of a group.
	 */
	selected?: boolean | undefined;
	/** Make the button appear smaller. */
	small?: boolean | undefined;
	/** Fill the available width instead of sizing to content (buttons are content-width by default). */
	full?: boolean | undefined;
}

/**
 * Get the full combined `className` string for a button from its styling variants.
 *
 * @param variants The button styling variants (block, flex, status, plus button toggles).
 * @returns A space-separated `className` string combining all the resolved variant classes.
 * @see https://shelving.cc/ui/getButtonClass
 */
export function getButtonClass(variants: ButtonVariants): string {
	return getClass(
		getBlockClass(variants),
		getModuleClass(BUTTON_CSS, "button", variants, variants.selected === false && "unselected"),
		getFlexClass(variants),
		getStatusClass(variants),
	);
}

/**
 * Component props for a `<Button>` component.
 *
 * @see https://shelving.cc/ui/ButtonProps
 */
export interface ButtonProps extends ButtonVariants, ClickableProps, ClassProps {}

/**
 * Render either a `<button>` or an `<a href="">` styled as a button, based on whether an `onClick` or `href` prop is provided.
 * - Content-width by default (never grows); it won't shrink below its label. Pass `full` to fill the available width.
 * - Light by default (a pale fill with dark text). Use `solid` for the main action, or `plain` / `outline` to de-emphasise.
 * - `color=` / `status=` set the colour of every look.
 * - Pass `selected` to make a group of buttons (such as tabs): the selected one keeps its look, the others drop their fill.
 * - Accepts all `ButtonVariants` styling props plus the `ClickableProps` (`onClick`, `href`, `disabled`, etc.).
 *
 * @kind component
 * @see https://shelving.cc/ui/Button
 */
export function Button({ className, ...props }: ButtonProps): ReactElement {
	return <Clickable {...props} className={getClass(getButtonClass(props), className)} />;
}
