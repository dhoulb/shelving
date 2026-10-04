import { ChevronUpIcon } from "@heroicons/react/24/solid";
import type { ReactElement, ReactNode } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getFlexClass } from "../style/Flex.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps } from "../util/props.js";
import DETAILS_CSS from "./Details.module.css";

const DETAILS_CLASS = getModuleClass(DETAILS_CSS, "details");
const DETAILS_SUMMARY_CLASS = getClass(getModuleClass(DETAILS_CSS, "summary"), getFlexClass({ between: true, gap: "normal" }));

/**
 * Props for `<Details>` — the summary title, the revealed content, and the open state.
 *
 * @see https://shelving.cc/ui/DetailsProps
 */
export interface DetailsProps extends BlockVariants, ClassProps {
	/** Content of the always-visible summary (e.g. a question). */
	title: ReactNode;
	/** Whether the panel starts expanded. */
	open?: boolean | undefined;
	/** Shared group name — panels with the same `name` open exclusively (only one at a time). */
	name?: string | undefined;
	/** Content revealed when the panel is expanded. */
	children: ReactNode;
}

/**
 * A collapsible panel with a title that is always visible, built on native `<details>` and `<summary>`.
 * - The panel animates to its true height (where `interpolate-size` and `::details-content` are supported).
 * - Give sibling panels a shared `name` to make them open exclusively.
 *
 * @kind component
 * @see https://shelving.cc/ui/Details
 */
export function Details({ title, open = false, name, children, className, ...props }: DetailsProps): ReactElement {
	return (
		<details className={getClass(DETAILS_CLASS, getBlockClass(props), className)} open={open} name={name}>
			<summary className={DETAILS_SUMMARY_CLASS}>
				<span>{title}</span>
				<ChevronUpIcon />
			</summary>
			{children}
		</details>
	);
}
