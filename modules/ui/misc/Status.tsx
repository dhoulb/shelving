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

/** Get a class for a status. */
export function getStatusClass(status: Status | StatusVariants): string | undefined {
	return getModuleClass(STATUS_CSS, status);
}
