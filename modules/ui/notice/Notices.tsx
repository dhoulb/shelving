import { type ReactElement, useEffect, ViewTransition } from "react";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import type { Status } from "../style/Status.js";
import { useTransitionValue } from "../transition/useTransitionValue.js";
import { getClass, getModuleClass } from "../util/css.js";
import { subscribeNotices } from "../util/notice.js";
import type { ClassProps } from "../util/props.js";
import { Notice } from "./Notice.js";
import type { NoticeStore } from "./NoticeStore.js";
import "./NoticesTransition.css";
import NOTICES_CSS from "./Notices.module.css";
import { NOTICES } from "./NoticesStore.js";

const NOTICES_CLASS = getModuleClass(NOTICES_CSS, "notices");

/**
 * Props for `<Notices>` — flex styling variants for the notices container.
 *
 * @see https://shelving.cc/ui/NoticesProps
 */
export interface NoticesProps extends FlexVariants, ClassProps {}

/**
 * Render the global list of notices and subscribe to incoming `"notice"` events.
 * - Listens for `"notice"` events on `window` (or that bubble up to `window`) and shows them in the global notice list.
 * - This is how e.g. `<Button>` and `<FormNotify>` components send notices into the global list.
 * - Each notice slides in and out in its own view transition. The other notices move to their new places in the same transition.
 *
 * @kind component
 * @see https://shelving.cc/ui/Notices
 */
export function Notices({ className, ...props }: NoticesProps): ReactElement {
	const notices = useTransitionValue(NOTICES);
	useEffect(() => {
		// Subscribe to global notices.
		return subscribeNotices((message, status) => NOTICES.show(message, status));
	});
	return (
		<aside className={getClass(NOTICES_CLASS, getFlexClass(props), className)}>
			{notices.map(notice => (
				<NoticeItem key={notice.key} notice={notice} />
			))}
		</aside>
	);
}

/**
 * Render one notice in its own view transition, and re-render when the notice changes in place.
 * - Module-private, but named without the `_` prefix: React and the hooks lint rule only treat a capitalised name as a component.
 */
function NoticeItem({ notice }: { notice: NoticeStore<Status> }): ReactElement {
	const { children, status } = useTransitionValue(notice);
	return (
		<ViewTransition enter="notice" exit="notice" update="notice-update">
			<Notice status={status}>{children}</Notice>
		</ViewTransition>
	);
}
