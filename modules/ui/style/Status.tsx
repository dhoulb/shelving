import type { ImmutableArray } from "../../util/array.js";
import { getClass, getModuleClass } from "../util/css.js";
import STATUS_CSS from "./Status.module.css";
import { TINT_CLASS } from "./Tint.js";

/**
 * Tuple of the status names selectable via the `status` variant prop.
 *
 * @see https://shelving.cc/ui/STATUSES
 */
export const STATUSES: ImmutableArray<Status> = ["loading", "info", "danger", "error", "warning", "success"];

/**
 * Allowed status names selected via the `status="info"` prop for components that support that support `StatusVariants`
 * - Applies a semantic tint color to the element.
 *
 * @see https://shelving.cc/ui/Status
 */
export type Status = "loading" | "info" | "danger" | "error" | "warning" | "success";

/**
 * Variant props for the semantic status of an element, e.g. `status="success"`.
 *
 * @see https://shelving.cc/ui/StatusVariants
 */
export interface StatusVariants {
	/** Status for the element. */
	status?: Status | undefined;
}

/**
 * Get the status tint class for a component from its `status` variant prop.
 *
 * - Sets the key `.tint-50` colour for an element (e.g. `--color-success`) based on e.g. `status="success"`.
 * - The full set of shades e.g. `--tint-20` and `--tint-95` are created for the selected colour, ready for the element to compose.
 *
 * @returns The combined tint + status class string, or `undefined` when no `status` is set.
 * @example getStatusClass({ status: "success" }) // "tint success"
 * @see https://shelving.cc/ui/getStatusClass
 */
export function getStatusClass({ status }: StatusVariants): string | undefined {
	if (status) return getClass(TINT_CLASS, getModuleClass(STATUS_CSS, status));
}
