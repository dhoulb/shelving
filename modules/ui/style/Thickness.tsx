import { getModuleClass } from "../util/css.js";
import THICKNESS_CSS from "./Thickness.module.css";

/**
 * Border-thickness variants — set the `--thickness` custom property which border-painting components
 * read in their `border-width` (or read from rules targeting their children, as Table does for
 * `<th>` / `<td>`). Each component's existing theme hook (e.g. `--card-thickness`, `--table-thickness`)
 * wins over the variant; the variant wins over the component's default.
 */
export interface ThicknessVariants {
	"thickness-none"?: boolean | undefined;
	"thickness-hairline"?: boolean | undefined;
	"thickness-xxthin"?: boolean | undefined;
	"thickness-xthin"?: boolean | undefined;
	"thickness-thin"?: boolean | undefined;
	"thickness-normal"?: boolean | undefined;
	"thickness-thick"?: boolean | undefined;
	"thickness-xthick"?: boolean | undefined;
	"thickness-xxthick"?: boolean | undefined;
}

export type Thickness = keyof ThicknessVariants;

export function getThicknessClass(thickness: Thickness | ThicknessVariants): string | undefined {
	return getModuleClass(THICKNESS_CSS, thickness);
}
