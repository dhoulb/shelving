import type { ReactElement } from "react";
import { BLOCK_CLASS } from "../block/Block.js";
import { StatusIcon } from "../misc/StatusIcon.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getStatus, getStatusClass, type Status, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import NOTICE_CSS from "./Notice.module.css";

export interface NoticeProps extends FlexVariants, ColorVariants, StatusVariants, OptionalChildProps {
	/** Status for the notice. Accepts a string (`status="success"`) or a boolean variant (`success`) — both forms compose the same class. */
	status?: Status | undefined;
	/** Icon for the notice (or `null` or `false` to hide the icon, defaults to `<StatusIcon>`). */
	icon?: ReactElement | false | undefined;
}

export function Notice({ children, status, icon, ...variants }: NoticeProps) {
	// Resolve the single status string: explicit `status=` prop wins, then a boolean variant, then a sensible default.
	const resolved: Status = status ?? getStatus(variants) ?? (children ? "info" : "loading");
	return (
		<aside
			role={resolved === "danger" || resolved === "error" ? "alert" : "status"}
			className={getClass(
				BLOCK_CLASS,
				getModuleClass(NOTICE_CSS, "notice", variants),
				getFlexClass(variants),
				getStatusClass(resolved), // Notices have status colours.
				getColorClass(variants), // Notices can also have raw colour overrides.
			)}
		>
			{icon ?? <StatusIcon status={resolved} />}
			{children}
		</aside>
	);
}

export const LOADING_NOTICE = <Notice status="loading" />;

export { NOTICE_CSS };
