import type { ReactElement } from "react";
import { BLOCK_CLASS } from "../block/Block.js";
import { StatusIcon } from "../misc/StatusIcon.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import NOTICE_CSS from "./Notice.module.css";

export interface NoticeProps extends FlexVariants, ColorVariants, StatusVariants, OptionalChildProps {
	/** Icon for the notice (or `null` or `false` to hide the icon, defaults to `<StatusIcon>`). */
	icon?: ReactElement | false | undefined;
}

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
				BLOCK_CLASS,
				getModuleClass(NOTICE_CSS, "notice", props),
				getFlexClass(props),
				getStatusClass(props),
				getColorClass(props),
			)}
		>
			{icon !== undefined ? icon : status && <StatusIcon status={status} />}
			{children}
		</aside>
	);
}

export const LOADING_NOTICE = <Notice status="loading" />;
