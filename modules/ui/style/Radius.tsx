import { getModuleClass } from "../util/css.js";
import RADIUS_CSS from "./Radius.module.css";

/**
 * Allowed values for border radius for components that support [`RadiusVariants`](/ui/RadiusVariants)
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Radius/RadiusVariant
 */
export type RadiusVariant = "none" | "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/**
 * Variant props for the corner radius of an element, e.g. `radius="large"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Radius/RadiusVariants
 */
export interface RadiusVariants {
	/** Corner radius of the element. */
	radius?: RadiusVariant | undefined;
}

/**
 * Get the corner-radius class for a component from its `radius` variant prop.
 *
 * @param variants
 * @returns The radius class string, or `undefined` when no `radius` is set.
 * @example getRadiusClass({ radius: "large" }) // "radius-large"
 * @see https://dhoulb.github.io/shelving/ui/style/Radius/getRadiusClass
 */
export function getRadiusClass({ radius }: RadiusVariants): string | undefined {
	return radius && getModuleClass(RADIUS_CSS, `radius-${radius}`);
}
