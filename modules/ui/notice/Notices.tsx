import { type ReactElement, useEffect, ViewTransition } from "react";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import type { Status } from "../style/Status.js";
import { useTransitionValue } from "../transition/useTransitionValue.js";
import { getClass, getModuleClass } from "../util/css.js";
import { subscribeNotices } from "../util/notice.js";
import type { ClassProps } from "../util/props.js";
import { Notice } from "./Notice.js";
import type { NoticeStore } from "./NoticeStore.js";
import NOTICES_CSS from "./Notices.module.css";
import { NOTICES } from "./NoticesStore.js";
import NOTICES_TRANSITION_CSS from "./NoticesTransition.module.css";

const NOTICES_CLASS = getModuleClass(NOTICES_CSS, "notices");

/**
 * Corner of the screen where `<Notices>` shows the list of notices.
 *
 * @see https://shelving.cc/ui/NoticesPosition
 */
export type NoticesPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/**
 * Props for `<Notices>` — the corner for the list, and flex styling variants for the notices container.
 *
 * @see https://shelving.cc/ui/NoticesProps
 */
export interface NoticesProps extends FlexVariants, ClassProps {
	/**
	 * Corner of the screen for the list. New notices slide in from this side.
	 * @default "bottom-right"
	 */
	position?: NoticesPosition | undefined;
}

/**
 * Render the global list of notices and subscribe to incoming `"notice"` events.
 * - Listens for `"notice"` events on `window` (or that bubble up to `window`) and shows them in the global notice list.
 * - This is how e.g. `<Button>` and `<FormNotify>` components send notices into the global list.
 * - Shows the list in the bottom-right corner, or in the corner that `position` sets.
 * - Each notice slides in and out in its own view transition, from the side of its corner. The other notices move to their new places in the same transition.
 *
 * @kind component
 * @see https://shelving.cc/ui/Notices
 */
export function Notices({ position = "bottom-right", className, ...props }: NoticesProps): ReactElement {
	const notices = useTransitionValue(NOTICES);
	useEffect(() => {
		// Subscribe to global notices.
		return subscribeNotices((message, status) => NOTICES.show(message, status));
	});
	const [vertical, horizontal] = position.split("-");
	return (
		<aside className={getClass(NOTICES_CLASS, getModuleClass(NOTICES_CSS, vertical, horizontal), getFlexClass(props), className)}>
			{notices.map(notice => (
				<NoticeItem key={notice.key} notice={notice} position={position} />
			))}
		</aside>
	);
}

/**
 * Render one notice in its own view transition, and re-render when the notice changes in place.
 * - Module-private, but named without the `_` prefix: React and the hooks lint rule only treat a capitalised name as a component.
 */
function NoticeItem({ notice, position }: { notice: NoticeStore<Status>; position: NoticesPosition }): ReactElement {
	const { children, status } = useTransitionValue(notice);
	// New and closed notices slide from the side of the corner. A notice that changes in place is drawn from the corner itself.
	const side = position.endsWith("left") ? "left" : "right";
	return (
		<ViewTransition
			enter={getModuleClass(NOTICES_TRANSITION_CSS, `notice-${side}`)}
			exit={getModuleClass(NOTICES_TRANSITION_CSS, `notice-${side}`)}
			update={getModuleClass(NOTICES_TRANSITION_CSS, `notice-update-${position}`)}
		>
			<Notice status={status}>{children}</Notice>
		</ViewTransition>
	);
}
