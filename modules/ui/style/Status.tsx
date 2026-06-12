import { getClass, getModuleClass } from "../util/css.js";
import STATUS_CSS from "./Status.module.css";
import { TINT_CLASS } from "./Tint.js";

/** Possible status strings. */
export const STATUSES = ["loading", "info", "danger", "error", "warning", "success"] as const;

/** Possible status strings. */
export type Status = (typeof STATUSES)[number];

/** Props for colored elements (either a simple boolean variant e.g. `blue` or a specific `color="purple"`). */
export interface StatusVariants {
	/** Specific status for the element. */
	status?: Status | undefined;
}

/**
 * CSS class that applies status tinting to an element.
 *
 * - Sets the key `.tint-50` color for an element (e.g. `--color-success` or `--color-failure`) based on e.g. `status="success"` or `status="error"`
 * - Full set of shades e.g. `--tint-20` and `--tint-95` are created for the selected color.
 * - Element can now compose these shades to style itself using the selected color.
 */
export function getStatusClass({ status }: StatusVariants): string | undefined {
	if (status) return getClass(TINT_CLASS, getModuleClass(STATUS_CSS, status));
}
