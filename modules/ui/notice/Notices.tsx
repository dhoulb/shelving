import { type ReactElement, useEffect } from "react";
import { useStore } from "../../react/useStore.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass, getModuleClass } from "../util/css.js";
import { subscribeNotices } from "../util/notice.js";
import type { ClassProps } from "../util/props.js";
import { Notice } from "./Notice.js";
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
 *
 * @kind component
 * @see https://shelving.cc/ui/Notices
 */
export function Notices({ className, ...props }: NoticesProps): ReactElement {
	const notices = useStore(NOTICES).value;
	useEffect(() => {
		// Subscribe to global notices.
		return subscribeNotices((message, status) => NOTICES.show(message, status));
	});
	return (
		<aside className={getClass(NOTICES_CLASS, getFlexClass(props), className)}>
			{notices.map(({ key, value }) => (
				<Notice key={key} {...value} />
			))}
		</aside>
	);
}
