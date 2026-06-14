import { getModuleClass } from "../util/css.js";
import THEME_CSS from "./Tint.module.css";

/**
 * CSS class that (re)calculates the full ladder of tint shades from the current global tint colour.
 *
 * - Applied by colour/status helpers so an element can compose shades like `--tint-20` and `--tint-95` of the selected hue.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Tint/TINT_CLASS
 */
export const TINT_CLASS = getModuleClass(THEME_CSS, "tint");
