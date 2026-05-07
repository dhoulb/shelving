import { type ReactElement, useEffect } from "react";
import { useStore } from "../../react/useStore.js";
import { ELEMENTS_CSS } from "../block/Elements.js";
import { getClass } from "../util/css.js";
import { subscribeNotices } from "../util/notice.js";
import { Notice } from "./Notice.js";
import NOTICES_CSS from "./Notices.module.css";
import { NOTICES } from "./NoticesStore.js";

/**
 * Output the global list of notices.
 * - Listens for `"notice"` events on `window` (or that bubble up to `window`) and shows them in the global notice list.
 * - This is how e.g. `<Button>` and `<FormNotify>` components send notices into the global list.
 */
export function Notices(): ReactElement {
	const notices = useStore(NOTICES).value;
	useEffect(() => {
		// Subscribe to global notices.
		return subscribeNotices((message, status) => NOTICES.show(message, status));
	});
	return (
		<div className={getClass(NOTICES_CSS.notices, ELEMENTS_CSS.elements, ELEMENTS_CSS.column)}>
			{notices.map(({ key, value }) => (
				<Notice key={key} {...value} />
			))}
		</div>
	);
}
