import type { ReactElement } from "react";
import { Icon } from "../misc/Icon.js";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import NOTICE_CSS from "./Notice.module.css";

const NOTICE_CLASS = getModuleClass(NOTICE_CSS, "notice");

/**
 * Props for `<Notice>` — flex/colour/status styling variants, optional `children`, and an optional `icon`.
 *
 * @see https://shelving.cc/ui/NoticeProps
 */
export interface NoticeProps extends BlockVariants, FlexVariants, StatusVariants, OptionalChildProps {
	/** Icon for the notice (or `null` or `false` to hide the icon, defaults to `<StatusIcon>`). */
	icon?: ReactElement | false | undefined;
}

/**
 * Block-level status callout with an icon and message, used to highlight feedback.
 *
 * - Shows a `<StatusIcon>` for the current `status` by default; pass `icon` to override, or `false`/`null` to hide it.
 * - Sets an ARIA `role` of `"alert"` for error/danger statuses, otherwise `"status"`.
 *
 * @kind component
 * @see https://shelving.cc/ui/Notice
 */
export function Notice({
	children, //
	icon,
	...props
}: NoticeProps) {
	const { status } = props;
	return (
		<aside
			role={status === "danger" || status === "error" ? "alert" : "status"}
			className={getClass(
				NOTICE_CLASS, //
				getBlockClass(props),
				getFlexClass(props),
				getStatusClass(props),
			)}
		>
			{icon !== undefined ? icon : status && <Icon status={status} />}
			{children}
		</aside>
	);
}

/**
 * Shared loading `<Notice>` element showing the loading spinner.
 *
 * @see https://shelving.cc/ui/LOADING_NOTICE
 */
export const LOADING_NOTICE = <Notice status="loading" />;
