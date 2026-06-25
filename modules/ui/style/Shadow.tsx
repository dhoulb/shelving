import { getModuleClass } from "../util/css.js";
import SHADOW_CSS from "./Shadow.module.css";

/**
 * Enumerated drop-shadow scale selectable via the `shadow="normal"` variant prop.
 *
 * @see https://shelving.cc/ui/ShadowVariant
 */
export type ShadowVariant = "none" | "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/**
 * Variant props for the drop shadow of an element, e.g. `shadow="large"`.
 *
 * @see https://shelving.cc/ui/ShadowVariants
 */
export interface ShadowVariants {
	/** Drop shadow of the element. */
	shadow?: ShadowVariant | undefined;
}

/**
 * Get the drop-shadow class for a component from its `shadow` variant prop.
 *
 * @returns The shadow class string, or `undefined` when no `shadow` is set.
 * @example getShadowClass({ shadow: "large" }) // "shadow-large"
 * @see https://shelving.cc/ui/getShadowClass
 */
export function getShadowClass({ shadow }: ShadowVariants): string | undefined {
	return shadow && getModuleClass(SHADOW_CSS, `shadow-${shadow}`);
}
