import { getClass, getModuleClass } from "../util/css.js";
import HEIGHT_CSS from "./Height.module.css";

/**
 * Enumerated height selectable via the `height` variant prop.
 * - `full` — at least the full height of the container.
 * - `1x`–`32x` — at least a multiple of `--space-normal` (1x–8x at 1x intervals, then 10x/12x, then 16x–32x at 4x intervals).
 * - Each value is a minimum (`min-block-size`), so the element grows when its content is taller and nothing is cut off.
 *
 * @see https://shelving.cc/ui/HeightVariant
 */
export type HeightVariant =
	| "full"
	| "1x"
	| "2x"
	| "3x"
	| "4x"
	| "5x"
	| "6x"
	| "7x"
	| "8x"
	| "10x"
	| "12x"
	| "16x"
	| "20x"
	| "24x"
	| "28x"
	| "32x";

/**
 * Variant props that set a component's height, and where its content sits inside that height, e.g. `height="full" middle`.
 *
 * @see https://shelving.cc/ui/HeightVariants
 */
export interface HeightVariants {
	/** Height of the element. It is a minimum, so the element grows when its content is taller. */
	height?: HeightVariant | undefined;
	/** Put the content at the top of the element (the default). */
	top?: boolean | undefined;
	/** Put the content in the vertical middle of the element. Use with `height`. */
	middle?: boolean | undefined;
	/** Put the content at the bottom of the element. Use with `height`. */
	bottom?: boolean | undefined;
}

/**
 * Get the height class for a component from its `height`, `top`, `middle` and `bottom` variant props.
 *
 * @returns The height class string, or `undefined` if no height variants are set.
 * @example getHeightClass({ height: "full", middle: true }) // "height height-full middle"
 * @see https://shelving.cc/ui/getHeightClass
 */
export function getHeightClass({ height, top, middle, bottom }: HeightVariants): string | undefined {
	if (height || top || middle || bottom)
		return getClass(
			height && getModuleClass(HEIGHT_CSS, "height", `height-${height}`),
			top && getModuleClass(HEIGHT_CSS, "top"),
			middle && getModuleClass(HEIGHT_CSS, "middle"),
			bottom && getModuleClass(HEIGHT_CSS, "bottom"),
		);
}
