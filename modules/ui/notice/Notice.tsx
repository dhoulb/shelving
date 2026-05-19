import type { ReactElement, ReactNode } from "react";
import { BLOCK_CLASS } from "../block/Block.js";
import { FLEX_CSS, type FlexVariants } from "../block/Flex.js";
import { type ColorVariants, getColorClass } from "../misc/Color.js";
import { getStatusClass, type Status } from "../misc/Status.js";
import { StatusIcon } from "../misc/StatusIcon.js";
import { getClass, getModuleClass } from "../util/css.js";
import NOTICE_CSS from "./Notice.module.css";

export interface NoticeProps extends FlexVariants, ColorVariants {
	/** Status for the notice. */
	status?: Status | undefined;
	/** Children for the notice. */
	children?: ReactNode;
	/** Icon for the notice (or `null` or `false` to hide the icon, defaults to `<StatusIcon>`). */
	icon?: ReactElement | false | undefined;
}

export function Notice({
	children,
	status = children ? "info" : "loading",
	icon = <StatusIcon status={status} />,
	...variants
}: NoticeProps) {
	return (
		<aside
			role={status === "danger" || status === "error" ? "alert" : "status"}
			className={getClass(
				BLOCK_CLASS,
				getModuleClass(NOTICE_CSS, "notice", variants), //
				getModuleClass(FLEX_CSS, "elements", variants),
				getStatusClass(status), // Notices have status colours.
				getColorClass(variants), // Notices can also have raw colour overrides.
			)}
		>
			{icon}
			{children}
		</aside>
	);
}

export const LOADING_NOTICE = <Notice status="loading" />;

export { NOTICE_CSS };
