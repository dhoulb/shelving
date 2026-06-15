import { getModuleClass } from "../util/css.js";
import SHADOW_CSS from "./Shadow.module.css";

/**
 * Enumerated drop-shadow scale selectable via the `shadow` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Shadow/UIShadow
 */
export type UIShadow = "none" | "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/**
 * Variant props for the drop shadow of an element, e.g. `shadow="large"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Shadow/ShadowVariants
 */
export interface ShadowVariants {
	/** Drop shadow of the element. */
	shadow?: UIShadow | undefined;
}

/**
 * Get the drop-shadow class for a component from its `shadow` variant prop.
 *
 * @param variants Variant props containing the optional `shadow` scale.
 * @returns The shadow class string, or `undefined` when no `shadow` is set.
 * @example getShadowClass({ shadow: "large" }) // "shadow-large"
 * @see https://dhoulb.github.io/shelving/ui/style/Shadow/getShadowClass
 */
export function getShadowClass({ shadow }: ShadowVariants): string | undefined {
	return shadow && getModuleClass(SHADOW_CSS, `shadow-${shadow}`);
}
