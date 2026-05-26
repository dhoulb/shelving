import { getModuleClass } from "../util/css.js";
import GAP_CSS from "./Gap.module.css";

/** Gap variants — sets `gap` on flex/grid containers and List/Definitions item spacing. */
export interface GapVariants {
	"gap-none"?: boolean | undefined;
	"gap-xxsmall"?: boolean | undefined;
	"gap-xsmall"?: boolean | undefined;
	"gap-small"?: boolean | undefined;
	"gap-normal"?: boolean | undefined;
	"gap-large"?: boolean | undefined;
	"gap-xlarge"?: boolean | undefined;
	"gap-xxlarge"?: boolean | undefined;
}

export type Gap = keyof GapVariants;

export function getGapClass(gap: Gap | GapVariants): string | undefined {
	return getModuleClass(GAP_CSS, gap);
}
