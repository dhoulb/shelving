import type { ReactElement } from "react";
import { getBlockClass } from "../block/Block.js";
import { StatusIcon } from "../misc/StatusIcon.js";
import type { ColorVariants } from "../style/Color.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import NOTICE_CSS from "./Notice.module.css";

/**
 * Props for `<Notice>` — flex/colour/status styling variants, optional `children`, and an optional `icon`.
 *
 * @see https://dhoulb.github.io/shelving/ui/notice/Notice/NoticeProps
 */
export interface NoticeProps extends FlexVariants, ColorVariants, StatusVariants, OptionalChildProps {
	/** Icon for the notice (or `null` or `false` to hide the icon, defaults to `<StatusIcon>`). */
	icon?: ReactElement | false | undefined;
}

/**
 * Block-level status callout with an icon and message, used to highlight feedback.
 *
 * - Shows a `<StatusIcon>` for the current `status` by default; pass `icon` to override, or `false`/`null` to hide it.
 * - Sets an ARIA `role` of `"alert"` for error/danger statuses, otherwise `"status"`.
 *
 * @param children The notice content.
 * @param icon Optional icon override (`false`/`null` hides it; defaults to the matching `<StatusIcon>`).
 * @param props Flex, colour, and status styling variants.
 * @returns The notice callout element.
 * @kind component
 * @example <Notice status="success">Saved your changes</Notice>
 * @see https://dhoulb.github.io/shelving/ui/notice/Notice/Notice
 */
export function Notice({
	children, //
	icon,
	...props
}: NoticeProps) {
	const { status } = props;
	return (
		<aside
			role={status === "danger" || status === "error" ? "alert" : "status"}
			className={getClass(getBlockClass(props), getModuleClass(NOTICE_CSS, "notice", props), getFlexClass(props), getStatusClass(props))}
		>
			{icon !== undefined ? icon : status && <StatusIcon status={status} />}
			{children}
		</aside>
	);
}

/**
 * Shared loading `<Notice>` element showing the loading spinner.
 *
 * @example <Suspense fallback={LOADING_NOTICE}>…</Suspense>
 * @see https://dhoulb.github.io/shelving/ui/notice/Notice/LOADING_NOTICE
 */
export const LOADING_NOTICE = <Notice status="loading" />;
