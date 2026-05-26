import { getModuleClass } from "../util/css.js";
import STATUS_CSS from "./Status.module.css";

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

/** Possible status strings. */
export type Status = keyof StatusVariants;

/** Status names in priority order — first truthy boolean variant wins when callers ask `getStatus()` to collapse a `StatusVariants` object into a single string. */
const STATUSES = ["loading", "info", "success", "warning", "danger", "error"] as const satisfies readonly Status[];

/** Collapse boolean status variants (`<Notice success />`) into the single string form (`"success"`). Returns `undefined` if no boolean is set. */
export function getStatus(variants: StatusVariants): Status | undefined {
	for (const s of STATUSES) if (variants[s]) return s;
	return undefined;
}

/** Get a class for a status. */
export function getStatusClass(status: Status | StatusVariants): string | undefined {
	return getModuleClass(STATUS_CSS, status);
}
