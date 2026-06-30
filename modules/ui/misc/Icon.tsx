import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import type { ComponentType, ReactElement } from "react";
import type { ColorVariants } from "../style/Color.js";
import type { SpaceVariants } from "../style/Space.js";
import { getStatusClass, type Status, type StatusVariants } from "../style/Status.js";
import type { TintVariant } from "../style/Tint.js";
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
export interface IconProps extends ColorVariants, StatusVariants, SpaceVariants {
	/**
	 * Set the icon to use. Defaults to appropriate icon for `status`
	 */
	icon?: ComponentType<{ className?: string | undefined }>;
	/**
	 * Size of the icon.
	 * @default var(--size-icon)
	 */
	size?: SizeVariant | undefined;
	/**
	 * Tint of the selected color.
	 * @default "50"
	 */
	tint?: TintVariant | undefined;
}

/**
 * Render the icon for a given status, coloured to match.
 *
 * - Picks a heroicon per status (`success`, `error`, `warning`, etc.), falling back to an info icon, and uses the animated `<Loading>` spinner for `"loading"`.
 *
 * @kind component
 * @see https://shelving.cc/ui/Icon
 */
export function Icon(props: IconProps): ReactElement {
	const { status = "info", icon: Element = STATUS_ICONS[status] ?? InformationCircleIcon } = props;
	return (
		<Element
			className={getClass(
				getModuleClass(ICON_CSS, "icon"), //
				getStatusClass(props),
				getTypographyClass(props), // Used for colour, size, and tint.
			)}
		/>
	);
}
