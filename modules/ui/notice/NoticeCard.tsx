import type { ReactElement, ReactNode } from "react";
import { type ColorVariants, getColorClass } from "../misc/Color.js";
import { getStatusClass, type Status } from "../misc/Status.js";
import { StatusIcon } from "../misc/StatusIcon.js";
import { getClass, getModuleClass } from "../util/css.js";
import NOTICE_CARD_CSS from "./NoticeCard.module.css";

export interface NoticeCardProps extends ColorVariants {
	/** Status for the notice card — drives the colour, the default icon, and the ARIA role. */
	status?: Status | undefined;
	/** Content for the notice card — laid out in a centered column. */
	children?: ReactNode;
	/** Icon for the notice card (or `false` to hide it; defaults to a large `<StatusIcon>` for the status). */
	icon?: ReactElement | false | undefined;
}

/**
 * Chunky, card-like status panel — the box treatment of a `Card` with the status styling of a `Notice`.
 * - Use for a prominent standalone message (e.g. a full-page "not found" or error state) where an inline `<Notice>` reads too quietly.
 * - Lays its icon and content out in a centered column; the icon defaults to a large `<StatusIcon>`, and a regular-size `<Button>` sits comfortably inside.
 *
 * @example <NoticeCard status="success">All done!<Button onClick={next}>Continue</Button></NoticeCard>
 */
export function NoticeCard({
	children,
	status = children ? "info" : "loading",
	icon = <StatusIcon status={status} xxlarge />,
	...variants
}: NoticeCardProps): ReactElement {
	return (
		<aside
			role={status === "danger" || status === "error" ? "alert" : "status"}
			className={getClass(
				getModuleClass(NOTICE_CARD_CSS, "card", variants), //
				getStatusClass(status), // Notice cards have status colours.
				getColorClass(variants), // Notice cards can also have raw colour overrides.
			)}
		>
			{icon}
			{children}
		</aside>
	);
}

export { NOTICE_CARD_CSS };
