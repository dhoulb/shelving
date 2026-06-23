import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import type { ComponentType, ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getStatusClass, type Status, type StatusVariants } from "../style/Status.js";
import { getTypographyClass, type SizeVariant } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import ICON_CSS from "./Icon.module.css";
import { Loading } from "./Loading.js";

const STATUS_ICONS: {
	[K in Status]?: ComponentType;
} = {
	loading: Loading,
	success: CheckCircleIcon,
	error: XCircleIcon,
	warning: ExclamationTriangleIcon,
	danger: ExclamationTriangleIcon,
};

/**
 * Props for `<Icon>` — the `status` to represent and optional icon `size`.
 *
 * @see https://shelving.cc/ui/IconProps
 */
export interface IconProps extends ColorVariants, StatusVariants {
	/**
	 * Set the icon to use. Defaults to appropriate icon matching for `status`
	 */
	icon?: ComponentType<{ className?: string | undefined }>;
	/**
	 * Size of the icon.
	 * @default 1lh
	 */
	size?: SizeVariant;
}

/**
 * Render the icon for a given status, coloured to match.
 *
 * - Picks a heroicon per status (`success`, `error`, `warning`, etc.), falling back to an info icon, and uses the animated `<Loading>` spinner for `"loading"`.
 *
 * @kind component
 * @example <Icon status="error" size="large" />
 * @see https://shelving.cc/ui/Icon
 */
export function Icon(props: IconProps): ReactElement {
	const { status = "info", icon: Element = STATUS_ICONS[status] ?? InformationCircleIcon } = props;
	return (
		<Element
			className={getClass(
				getModuleClass(ICON_CSS, "icon"), //
				getColorClass(props),
				getStatusClass(props),
				getTypographyClass(props),
			)}
		/>
	);
}
