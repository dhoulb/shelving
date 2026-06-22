import { getModuleClass } from "../util/css.js";
import SPACE_CSS from "./Space.module.css";

/**
 * Allowed values for block spacing for components that support `SpaceVariants`
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Space/SpaceValue
 */
export type SpaceValue =
	| "section"
	| "paragraph"
	| "none"
	| "xxsmall"
	| "xsmall"
	| "small"
	| "normal"
	| "large"
	| "xlarge"
	| "xxlarge"
	| "1x"
	| "2x"
	| "3x"
	| "4x"
	| "5x"
	| "6x"
	| "7x"
	| "8x"
	| "9x"
	| "10x";

/**
 * Variants to control block spacing on components, e.g. `space="large"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Space/SpaceVariants
 */
export interface SpaceVariants {
	/** Block spacing for this component. */
	space?: SpaceValue | undefined;
}

/**
 * Get the block spacing class for a component from its `space=""` variant prop.
 *
 * @param variants
 * @returns The space class string, or `undefined` when no `space` is set.
 * @example getSpaceClass({ space: "large" }) // "large"
 * @see https://dhoulb.github.io/shelving/ui/style/Space/getSpaceClass
 */
export function getSpaceClass({ space }: SpaceVariants): string | undefined {
	return space && getModuleClass(SPACE_CSS, `space-${space}`);
}
