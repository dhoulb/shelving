import type { ReactElement } from "react";
import { getIndentClass, type IndentVariants } from "../style/Indent.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getRadiusClass, type RadiusVariants } from "../style/Radius.js";
import { getShadowClass, type ShadowVariants } from "../style/Shadow.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import styles from "./Modal.module.css";

/**
 * Variant props for `<Modal>` — pin the panel to one edge of the screen.
 *
 * - Set one of `top`, `right`, `bottom`, or `left`. Without one, the panel is centred.
 * - If more than one is set, the first in the order `top`, `right`, `bottom`, `left` wins.
 *
 * @see https://shelving.cc/ui/ModalVariants
 */
export interface ModalVariants {
	/** Pin the panel to the top edge, full width, and slide it in from the top. */
	top?: boolean | undefined;
	/** Pin the panel to the right edge, full height, and slide it in from the right. */
	right?: boolean | undefined;
	/** Pin the panel to the bottom edge, full width, and slide it in from the bottom. */
	bottom?: boolean | undefined;
	/** Pin the panel to the left edge, full height, and slide it in from the left. */
	left?: boolean | undefined;
}

/**
 * Props for `<Modal>` — edge, padding, indent, radius, and shadow variants, optional `children` content, and an optional `className`.
 *
 * @see https://shelving.cc/ui/ModalProps
 */
export interface ModalProps
	extends ModalVariants,
		PaddingVariants,
		IndentVariants,
		RadiusVariants,
		ShadowVariants,
		OptionalChildProps,
		ClassProps {}

/**
 * Styled `<aside>` panel for content inside a `<Dialog>`, with dark text on a light surface.
 *
 * - Centred by default. It fades in and out with its `<Dialog>`.
 * - Has no drop shadow by default — set `shadow="small"`, `shadow="normal"` or `shadow="large"` to raise it.
 * - `top`, `right`, `bottom`, or `left` pins it to that edge. It then takes its own layer in the `<Dialog>` view transition, and slides in from that edge and out to it.
 *
 * @kind component
 * @see https://shelving.cc/ui/Modal
 */
export function Modal({ children, className, ...props }: ModalProps): ReactElement {
	const side = _getSide(props);
	return (
		<aside
			className={getClass(
				getModuleClass(styles, "modal"), //
				side && getModuleClass(styles, side),
				getPaddingClass(props),
				getIndentClass(props),
				getRadiusClass(props),
				getShadowClass(props),
				className,
			)}
		>
			{children}
		</aside>
	);
}

/** Get the edge a modal is pinned to, if any. */
function _getSide({ top, right, bottom, left }: ModalVariants): keyof ModalVariants | undefined {
	if (top) return "top";
	if (right) return "right";
	if (bottom) return "bottom";
	if (left) return "left";
}
