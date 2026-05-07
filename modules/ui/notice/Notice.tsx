import type { ReactElement, ReactNode } from "react";
import { ELEMENT_CSS } from "../block/Element.js";
import { ELEMENTS_CSS, type ElementsVariants } from "../block/Elements.js";
import { getClass, getModuleClass } from "../util/css.js";
import NOTICE_CSS from "./Notice.module.css";
import { getStatusClass, type Status } from "./Status.js";
import { StatusIcon } from "./StatusIcon.js";

export interface NoticeProps extends ElementsVariants {
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
				ELEMENT_CSS.element,
				getModuleClass(NOTICE_CSS, "notice", variants), //
				getModuleClass(ELEMENTS_CSS, "elements", variants),
				getStatusClass(status), // Buttons have status colours.
			)}
		>
			{icon}
			{children}
		</aside>
	);
}

export const LOADING_NOTICE = <Notice status="loading" />;

export { NOTICE_CSS };
