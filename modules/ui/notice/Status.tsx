import { getModuleClass } from "../util/css.js";
import STATUS_CSS from "./Status.module.css";

/** Variants for statuses. */
export type StatusVariants = {
	/** Element has loading colors. */
	loading?: boolean | undefined;
	/** Element has primary colors. */
	primary?: boolean | undefined;
	/** Element has secondary colors. */
	secondary?: boolean | undefined;
	/** Element has tertiary colors. */
	tertiary?: boolean | undefined;
	/** Element has quiet colors. */
	quiet?: boolean | undefined;
	/** Element has info colors. */
	info?: boolean | undefined;
	/** Element has danger colors. */
	danger?: boolean | undefined;
	/** Element has error colors. */
	error?: boolean | undefined;
	/** Element has warning colors. */
	warning?: boolean | undefined;
	/** Element has highlight colors. */
	highlight?: boolean | undefined;
	/** Element has success colors. */
	success?: boolean | undefined;
};

/** Possible status strings. */
export type Status = keyof StatusVariants;

/** Get a class for a status. */
export function getStatusClass(status: Status | StatusVariants): string {
	return getModuleClass(STATUS_CSS, status);
}
