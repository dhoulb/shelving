import type { ComponentType, ReactElement } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "shared/icon";
import { Loading } from "../misc/Loading.js";
import { getModuleClass } from "../util/css.js";
import type { Status } from "./Status.js";
import statusStyles from "./Status.module.css";
import styles from "./StatusIcon.module.css";

const STATUS_ICONS: {
	[K in Status]?: ComponentType<Record<string, unknown>>;
} = {
	loading: Loading,
	primary: CheckCircleIcon,
	success: CheckCircleIcon,
	error: XCircleIcon,
	warning: ExclamationTriangleIcon,
	danger: ExclamationTriangleIcon,
};

export interface StatusIconProps {
	status?: Status;
	small?: boolean;
	normal?: boolean;
	large?: boolean;
	xlarge?: boolean;
	xxlarge?: boolean;
}

/** Output a status icon based on the current status of something. */
export function StatusIcon({ status = "info", ...variants }: StatusIconProps): ReactElement {
	const Icon = STATUS_ICONS[status] ?? InformationCircleIcon;
	return <Icon className={`${getModuleClass(styles, "icon", variants)} ${getModuleClass(statusStyles, status)}`} />;
}
