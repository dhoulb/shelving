import { getClass, getModuleClass } from "../util/css.js";
import STATUS_CSS from "./Status.module.css";
import { TINT_CLASS } from "./Tint.js";

/** Possible status strings. */
export const STATUSES = ["loading", "info", "danger", "error", "warning", "success"] as const;

/** Possible status strings. */
export type Status = (typeof STATUSES)[number];

/** Variants for statuses. */
export interface StatusVariants {
	/** Element has loading status. */
	loading?: boolean | undefined;
	/** Element has info status. */
	info?: boolean | undefined;
	/** Element has danger status. */
	danger?: boolean | undefined;
	/** Element has error status. */
	error?: boolean | undefined;
	/** Element has warning status. */
	warning?: boolean | undefined;
	/** Element has success status. */
	success?: boolean | undefined;
}

/** Props for colored elements (either a simple boolean variant e.g. `blue` or a specific `color="purple"`). */
export interface StatusProps extends StatusVariants {
	/** Specific status for the element. */
	status?: Status | undefined;
}

/** Get a status from a set of props (first one wins). */
export function getStatus(props: StatusProps): Status | undefined {
	if (props.status) return props.status;
	for (const status of STATUSES) if (props[status]) return status;
}

/** Get a class for a status. */
export function getStatusClass(status: Status | StatusProps | undefined): string | undefined {
	if (typeof status !== "undefined")
		return getClass(TINT_CLASS, getModuleClass(STATUS_CSS, typeof status === "string" ? status : getStatus(status)));
}
