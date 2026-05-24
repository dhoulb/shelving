import { getModuleClass } from "../util/css.js";
import SURFACE_CSS from "./Surface.module.css";

/**
 * Hashed `.surface` class. Add to any component that paints a background with `--color-surface` and you'll
 * get depth-tracking (via descendant selectors in `Surface.module.css`) and an auto-computed background
 * that darkens by 10% per level of surface nesting (up to 4 levels).
 *
 * Apply via `getClass(SURFACE_CLASS, …)` in component JSX. Components carrying this class should not
 * redeclare `background` themselves — the `.surface` rule owns it.
 */
export const SURFACE_CLASS = getModuleClass(SURFACE_CSS, "surface");
