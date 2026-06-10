import { getModuleClass } from "../util/css.js";
import THEME_CSS from "./Tint.module.css";

/** Tint class (re)calculates shades of the current global tint colour. */
export const TINT_CLASS = getModuleClass(THEME_CSS, "tint");
