import { getClass, getModuleClass } from "../util/css.js";
import THEME_CSS from "./Tint.module.css";

/**
 * Shades of the currently selected tint color, from `"00"` (black) through `"50"` (the hue itself) to `"100"` (white).
 *
 * - `"contrast"` is black or white, whichever reads better on `"50"`.
 *
 * @see https://shelving.cc/ui/TintVariant
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
	| "100"
	| "contrast";

/**
 * CSS class that (re)calculates the full ladder of tint shades from the current global tint colour.
 *
 * - Applied by colour/status helpers so an element can compose shades like `--tint-20` and `--tint-95` of the selected hue.
 * - Also adds the plain global `tint` class, so theme files can target the recompute scope with `:root, .tint { … }`.
 *
 * @see https://shelving.cc/ui/TINT_CLASS
 */
export const TINT_CLASS = getClass("tint", getModuleClass(THEME_CSS, "tint"));
