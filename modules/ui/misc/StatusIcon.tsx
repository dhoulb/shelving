import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import type { ComponentType, ReactElement } from "react";
import type { Status } from "../style/Status.js";
import statusStyles from "../style/Status.module.css";
import { getModuleClass } from "../util/css.js";
import { Loading } from "./Loading.js";
import styles from "./StatusIcon.module.css";

const STATUS_ICONS: {
	[K in Status]?: ComponentType<Record<string, unknown>>;
} = {
	loading: Loading,
	success: CheckCircleIcon,
	error: XCircleIcon,
	warning: ExclamationTriangleIcon,
	danger: ExclamationTriangleIcon,
};

/**
 * Props for `<StatusIcon>` — the `status` to represent and optional icon `size`.
 *
 * @see https://dhoulb.github.io/shelving/ui/misc/StatusIcon/StatusIconProps
 */
export interface StatusIconProps {
	status?: Status;
	/** Size of the icon (defaults to the current line height). */
	size?: "small" | "normal" | "large" | "xlarge" | "xxlarge" | undefined;
}

/**
 * Render the icon for a given status, coloured to match.
 *
 * - Picks a heroicon per status (`success`, `error`, `warning`, etc.), falling back to an info icon, and uses the animated [`<Loading>`](/ui/Loading) spinner for `"loading"`.
 *
 * @param status The status to represent (defaults to `"info"`).
 * @param size Optional icon size (defaults to the current line height).
 * @returns The status icon element.
 * @kind component
 * @example <StatusIcon status="error" size="large" />
 * @see https://dhoulb.github.io/shelving/ui/misc/StatusIcon/StatusIcon
 */
export function StatusIcon({ status = "info", size }: StatusIconProps): ReactElement {
	const Icon = STATUS_ICONS[status] ?? InformationCircleIcon;
	return <Icon className={`${getModuleClass(styles, "icon", size)} ${getModuleClass(statusStyles, status)}`} />;
}
