import type { ReactElement, ReactNode } from "react";
import { BLOCK_CLASS } from "../block/Block.js";
import { type ColorVariants, getColorClass } from "../misc/Color.js";
import { getStatusClass, type Status } from "../misc/Status.js";
import { StatusIcon } from "../misc/StatusIcon.js";
import { getClass, getModuleClass } from "../util/css.js";
import NOTICE_CSS from "./Notice.module.css";

export interface NoticeProps extends ColorVariants {
	/** Status for the notice. */
	status?: Status | undefined;
	/** Message content for the notice. */
	children?: ReactNode;
	/** Icon for the notice (or `null` or `false` to hide the icon, defaults to `<StatusIcon>`). */
	icon?: ReactElement | false | undefined;
	/** Actions (e.g. buttons) shown on their own row below the message. */
	actions?: ReactNode | undefined;
}

/**
 * Status banner with an icon, a message, and optional actions.
 * - Renders an `<aside>` with the matching status colour and ARIA role.
 * - The icon always sits beside the message on one row; `actions` (e.g. buttons) get their own full-width row below.
 *
 * @example <Notice status="success">Your changes have been saved.</Notice>
 * @example <Notice status="error" actions={<Button onClick={retry}>Retry</Button>}>Something went wrong.</Notice>
 */
export function Notice({
	children,
	status = children ? "info" : "loading",
	icon = <StatusIcon status={status} />,
	actions,
	...variants
}: NoticeProps): ReactElement {
	return (
		<aside
			role={status === "danger" || status === "error" ? "alert" : "status"}
			className={getClass(
				BLOCK_CLASS,
				getModuleClass(NOTICE_CSS, "notice", variants), //
				getStatusClass(status), // Notices have status colours.
				getColorClass(variants), // Notices can also have raw colour overrides.
			)}
		>
			<div className={NOTICE_CSS.body}>
				{icon}
				{children && <div className={NOTICE_CSS.message}>{children}</div>}
			</div>
			{actions && <div className={NOTICE_CSS.actions}>{actions}</div>}
		</aside>
	);
}

export const LOADING_NOTICE = <Notice status="loading" />;

export { NOTICE_CSS };
