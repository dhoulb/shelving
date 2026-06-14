import { getClass, getModuleClass } from "../util/css.js";
import STATUS_CSS from "./Status.module.css";
import { TINT_CLASS } from "./Tint.js";

/**
 * Tuple of the status names selectable via the `status` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Status/STATUSES
 */
export const STATUSES = ["loading", "info", "danger", "error", "warning", "success"] as const;

/**
 * Enumerated status name selectable via the `status` variant prop — maps to a semantic tint colour.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Status/Status
 */
export type Status = (typeof STATUSES)[number];

/**
 * Variant props for the semantic status of an element, e.g. `status="success"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Status/StatusVariants
 */
export interface StatusVariants {
	/** Specific status for the element. */
	status?: Status | undefined;
}

/**
 * Get the status tint class for a component from its `status` variant prop.
 *
 * - Sets the key `.tint-50` colour for an element (e.g. `--color-success`) based on e.g. `status="success"`.
 * - The full set of shades e.g. `--tint-20` and `--tint-95` are created for the selected colour, ready for the element to compose.
 *
 * @param variants Variant props containing the optional `status` selection.
 * @returns The combined tint + status class string, or `undefined` when no `status` is set.
 * @example getStatusClass({ status: "success" }) // "tint success"
 * @see https://dhoulb.github.io/shelving/ui/style/Status/getStatusClass
 */
export function getStatusClass({ status }: StatusVariants): string | undefined {
	if (status) return getClass(TINT_CLASS, getModuleClass(STATUS_CSS, status));
}
