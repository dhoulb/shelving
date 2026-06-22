import { getModuleClass } from "../util/css.js";
import THEME_CSS from "./Tint.module.css";

/**
 * Shades of the currently selected tint color, from `"00"` (black) through `"50"` (the hue itself) to `"100"` (white).
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Tint/TintVariant
 */
export type TintVariant =
	| "00"
	| "05"
	| "10"
	| "15"
	| "20"
	| "25"
	| "30"
	| "35"
	| "40"
	| "45"
	| "50"
	| "55"
	| "60"
	| "65"
	| "70"
	| "75"
	| "80"
	| "85"
	| "90"
	| "95"
	| "100";

/**
 * CSS class that (re)calculates the full ladder of tint shades from the current global tint colour.
 *
 * - Applied by colour/status helpers so an element can compose shades like `--tint-20` and `--tint-95` of the selected hue.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Tint/TINT_CLASS
 */
export const TINT_CLASS = getModuleClass(THEME_CSS, "tint");
